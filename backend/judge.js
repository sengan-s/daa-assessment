const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

function compareOutput(actual, expected) {
  if (typeof actual !== 'string' || typeof expected !== 'string') return actual === expected;

  const normalize = (str) => {
    return str
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };

  const normActual = normalize(actual);
  const normExpected = normalize(expected);

  if (normActual === normExpected) return true;

  // Float tolerance check
  const actualTokens = normActual.split(/\s+/);
  const expectedTokens = normExpected.split(/\s+/);

  if (actualTokens.length === expectedTokens.length) {
    let allMatch = true;
    for (let i = 0; i < actualTokens.length; i++) {
      const a = actualTokens[i];
      const e = expectedTokens[i];
      if (a !== e) {
        const numA = parseFloat(a);
        const numE = parseFloat(e);
        if (!isNaN(numA) && !isNaN(numE)) {
          if (Math.abs(numA - numE) > 1e-5) {
            allMatch = false;
            break;
          }
        } else {
          allMatch = false;
          break;
        }
      }
    }
    if (allMatch) return true;
  }

  return false;
}

function spawnAndWait(command, args, cwd, stdinData = null) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd });
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
      try { child.kill('SIGKILL'); } catch(e) {}
    }, 5000);

    // Simple memory check heuristic (can be improved in a real sandbox)
    const memCheckTimer = setInterval(() => {
      try {
        if (child.pid && os.platform() !== 'win32') {
          // If we had a cross-platform way to check child memory precisely, we'd do it here.
          // For now, we rely on Java's -Xmx or OS limits.
        }
      } catch (e) {}
    }, 500);

    child.stdout.on('data', (data) => {
      output += data.toString();
      // hard limit on output size (10MB) to prevent OOM
      if (output.length > 10 * 1024 * 1024) {
        try { child.kill('SIGKILL'); } catch(e) {}
      }
    });

    child.stderr.on('data', (data) => {
      runtimeError += data.toString();
      if (runtimeError.includes('java.lang.OutOfMemoryError') || runtimeError.includes('MemoryError')) {
        isMemoryLimit = true;
      }
    });

    child.on('error', (err) => resolve({ status: 'RE', details: 'Failed to start process: ' + err.message }));

    child.on('close', (code) => {
      clearTimeout(timeoutTimer);
      clearInterval(memCheckTimer);
      if (isTimeout) return resolve({ status: 'TLE' });
      if (isMemoryLimit) return resolve({ status: 'MLE' });
      if (code !== 0) return resolve({ status: 'RE', details: runtimeError });
      resolve({ status: 'PASS', actual: output.trim() });
    });
  });
}

function compileCode(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd });
    let compileError = '';
    child.stderr.on('data', (data) => {
      compileError += data.toString();
    });
    child.on('error', (err) => resolve({ success: false, error: 'Failed to start compiler: ' + err.message }));
    child.on('close', (code) => {
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
          if (compareOutput(res.actual, tc.expected)) {
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

      const compRes = await compileCode('gcc', ['main.c', '-o', 'main'], tempDir);
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
            if (compareOutput(res.actual, tc.expected)) {
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
      // For Java, replace public class ... with class Main so it matches filename
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
            if (compareOutput(res.actual, tc.expected)) {
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
