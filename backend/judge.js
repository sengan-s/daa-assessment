const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');

let isBwrapAvailable = false;
try {
  if (os.platform() === 'linux') {
    execSync('which bwrap', { stdio: 'ignore' });
    isBwrapAvailable = true;
  }
} catch (e) {
  isBwrapAvailable = false;
}

let isPrlimitAvailable = false;
try {
  if (os.platform() === 'linux') {
    execSync('which prlimit', { stdio: 'ignore' });
    isPrlimitAvailable = true;
  }
} catch (e) {
  isPrlimitAvailable = false;
}

function compareOutput(actual, expected, validationRules = {}) {
  if (typeof actual !== 'string' || typeof expected !== 'string') return actual === expected;

  const normalize = (str) => str.replace(/\r\n/g, '\n').trimEnd();
  
  const actStr = normalize(actual);
  const expStr = normalize(expected);

  if (actStr === expStr) return true;

  if (validationRules.ignoreOrder) {
    const actSet = actStr.split(/\s+/).filter(t => t.length > 0).sort();
    const expSet = expStr.split(/\s+/).filter(t => t.length > 0).sort();
    if (actSet.length !== expSet.length) return false;
    for (let i = 0; i < actSet.length; i++) {
       const a = actSet[i];
       const e = expSet[i];
       if (a !== e) {
         const numA = parseFloat(a);
         const numE = parseFloat(e);
         if (!isNaN(numA) && !isNaN(numE)) {
           if (Math.abs(numA - numE) > (validationRules.tolerance || 1e-6)) return false;
         } else {
           return false;
         }
       }
    }
    return true;
  }

  const actLines = actStr.split('\n').map(l => l.trimEnd());
  const expLines = expStr.split('\n').map(l => l.trimEnd());

  while (actLines.length > 0 && actLines[actLines.length - 1] === '') actLines.pop();
  while (expLines.length > 0 && expLines[expLines.length - 1] === '') expLines.pop();

  if (actLines.length !== expLines.length) return false;

  const tolerance = validationRules.tolerance !== undefined ? validationRules.tolerance : 1e-6;

  for (let i = 0; i < actLines.length; i++) {
    const a = actLines[i];
    const e = expLines[i];
    if (a === e) continue;

    const actTokens = a.split(/\s+/).filter(t => t.length > 0);
    const expTokens = e.split(/\s+/).filter(t => t.length > 0);

    if (actTokens.length !== expTokens.length) return false;

    for (let j = 0; j < actTokens.length; j++) {
      if (actTokens[j] !== expTokens[j]) {
        const numA = parseFloat(actTokens[j]);
        const numE = parseFloat(expTokens[j]);
        if (!isNaN(numA) && !isNaN(numE)) {
          if (Math.abs(numA - numE) > tolerance) {
            return false;
          }
        } else {
          return false;
        }
      }
    }
  }

  return true;
}

function spawnAndWait(command, args, cwd, stdinData = null) {
  return new Promise((resolve) => {
    const TIME_LIMIT_MS = 5000;
    const MEMORY_LIMIT_BYTES = 256 * 1024 * 1024; // 256MB
    
    let finalCommand = command;
    let finalArgs = args;

    if (isBwrapAvailable) {
      finalCommand = 'bwrap';
      finalArgs = [
        '--ro-bind', '/', '/',
        '--dev', '/dev',
        '--proc', '/proc',
        '--tmpfs', '/tmp',
        '--bind', cwd, cwd,
        '--unshare-all',
        '--die-with-parent',
        '--setenv', 'PATH', process.env.PATH || '/usr/bin:/bin'
      ];
      if (isPrlimitAvailable) {
        finalArgs.push('prlimit', `--cpu=${Math.ceil(TIME_LIMIT_MS / 1000)}`);
        if (command !== 'java') {
          finalArgs.push(`--as=${MEMORY_LIMIT_BYTES}`);
        }
      }
      finalArgs.push(command, ...args);
    } else if (isPrlimitAvailable) {
      finalCommand = 'prlimit';
      finalArgs = [
        `--cpu=${Math.ceil(TIME_LIMIT_MS / 1000)}`
      ];
      if (command !== 'java') {
        finalArgs.push(`--as=${MEMORY_LIMIT_BYTES}`);
      }
      finalArgs.push(command, ...args);
    }

    const child = spawn(finalCommand, finalArgs, { cwd });
    let output = '';
    let runtimeError = '';
    let isTimeout = false;
    let isMemoryLimit = false;

    if (stdinData) {
      child.stdin.write(stdinData);
      child.stdin.end();
    }

    const timeoutTimer = setTimeout(() => {
      isTimeout = true;
      try { process.kill(child.pid, 'SIGKILL'); } catch(e) {}
    }, TIME_LIMIT_MS);

    child.stdout.on('data', (data) => {
      output += data.toString();
      if (output.length > 20 * 1024 * 1024) {
        try { process.kill(child.pid, 'SIGKILL'); } catch(e) {}
      }
    });

    child.stderr.on('data', (data) => {
      runtimeError += data.toString();
      if (runtimeError.includes('java.lang.OutOfMemoryError') || runtimeError.includes('MemoryError') || runtimeError.includes('std::bad_alloc')) {
        isMemoryLimit = true;
      }
    });

    child.on('error', (err) => resolve({ status: 'RE', details: 'Failed to start process: ' + err.message }));

    child.on('close', (code, signal) => {
      clearTimeout(timeoutTimer);
      if (isTimeout || signal === 'SIGKILL' || signal === 'SIGXCPU') return resolve({ status: 'TLE' });
      if (isMemoryLimit || signal === 'SIGSEGV') return resolve({ status: 'MLE' });
      if (code !== 0) return resolve({ status: 'RE', details: runtimeError.trim() });
      resolve({ status: 'PASS', actual: output.trim() });
    });
  });
}

function compileCode(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd });
    let compileError = '';
    
    const timeoutTimer = setTimeout(() => {
      try { process.kill(child.pid, 'SIGKILL'); } catch(e) {}
    }, 10000); // 10s compile limit

    child.stderr.on('data', (data) => {
      compileError += data.toString();
    });
    
    child.on('error', (err) => {
      clearTimeout(timeoutTimer);
      resolve({ success: false, error: 'Failed to start compiler: ' + err.message });
    });
    
    child.on('close', (code, signal) => {
      clearTimeout(timeoutTimer);
      if (signal === 'SIGKILL') return resolve({ success: false, error: 'Compilation Time Limit Exceeded' });
      if (code !== 0) {
        return resolve({ success: false, error: compileError });
      }
      resolve({ success: true });
    });
  });
}

async function evaluateCode(problem, solutionCode, language, testCasesToRun) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'judge-'));
  const results = [];
  let passedCount = 0;

  try {
    if (language === 'python') {
      const mainFile = path.join(tempDir, 'main.py');
      fs.writeFileSync(mainFile, solutionCode);

      for (let i = 0; i < testCasesToRun.length; i++) {
        const tc = testCasesToRun[i];
        const pythonExecutable = os.platform() === 'win32' ? 'python' : 'python3';
        const res = await spawnAndWait(pythonExecutable, ['main.py'], tempDir, tc.input);
        
        const formattedResult = { index: i + 1, isHidden: tc.isHidden, status: res.status };
        if (res.status === 'PASS') {
          if (compareOutput(res.actual, tc.expected, problem.validationRules || {})) {
            passedCount++;
            formattedResult.status = 'AC';
          } else {
            formattedResult.status = 'WA';
          }
        }
        if (!tc.isHidden) {
          formattedResult.expected = tc.expected;
          formattedResult.actual = res.actual;
          formattedResult.details = res.details;
        }
        results.push(formattedResult);
      }
    } 
    else if (language === 'c') {
      const mainFile = path.join(tempDir, 'main.c');
      fs.writeFileSync(mainFile, solutionCode);

      const compRes = await compileCode('gcc', ['main.c', '-o', 'main', '-O2', '-lm'], tempDir);
      if (!compRes.success) {
        for (let i = 0; i < testCasesToRun.length; i++) {
          const formattedResult = {
            index: i + 1, isHidden: testCasesToRun[i].isHidden, status: 'CE'
          };
          if (!testCasesToRun[i].isHidden) formattedResult.details = compRes.error;
          results.push(formattedResult);
        }
      } else {
        const exePath = path.join(tempDir, os.platform() === 'win32' ? 'main.exe' : 'main');
        for (let i = 0; i < testCasesToRun.length; i++) {
          const tc = testCasesToRun[i];
          const res = await spawnAndWait(exePath, [], tempDir, tc.input);
          
          const formattedResult = { index: i + 1, isHidden: tc.isHidden, status: res.status };
          if (res.status === 'PASS') {
            if (compareOutput(res.actual, tc.expected, problem.validationRules || {})) {
              passedCount++;
              formattedResult.status = 'AC';
            } else {
              formattedResult.status = 'WA';
            }
          }
          if (!tc.isHidden) {
            formattedResult.expected = tc.expected;
            formattedResult.actual = res.actual;
            formattedResult.details = res.details;
          }
          results.push(formattedResult);
        }
      }
    }
    else {
      // Java
      const mainFile = path.join(tempDir, 'Main.java');
      const javaCode = solutionCode.replace(/public\s+class\s+[A-Za-z0-9_]+/g, 'class Main');
      fs.writeFileSync(mainFile, javaCode);

      const compRes = await compileCode('javac', ['Main.java'], tempDir);
      if (!compRes.success) {
        for (let i = 0; i < testCasesToRun.length; i++) {
          const formattedResult = {
            index: i + 1, isHidden: testCasesToRun[i].isHidden, status: 'CE'
          };
          if (!testCasesToRun[i].isHidden) formattedResult.details = compRes.error;
          results.push(formattedResult);
        }
      } else {
        for (let i = 0; i < testCasesToRun.length; i++) {
          const tc = testCasesToRun[i];
          const res = await spawnAndWait('java', ['-Xmx256M', 'Main'], tempDir, tc.input);
          
          const formattedResult = { index: i + 1, isHidden: tc.isHidden, status: res.status };
          if (res.status === 'PASS') {
            if (compareOutput(res.actual, tc.expected, problem.validationRules || {})) {
              passedCount++;
              formattedResult.status = 'AC';
            } else {
              formattedResult.status = 'WA';
            }
          }
          if (!tc.isHidden) {
            formattedResult.expected = tc.expected;
            formattedResult.actual = res.actual;
            formattedResult.details = res.details;
          }
          results.push(formattedResult);
        }
      }
    }
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }

  const marks = Math.round((passedCount / problem.testCases.length) * problem.marks);

  return {
    results,
    passedCount,
    totalCount: problem.testCases.length,
    marks
  };
}

module.exports = { evaluateCode };
