const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

function compareOutput(actual, expected, problem) {
  if (problem && typeof problem.validator === 'function') {
    return problem.validator(actual, expected);
  }
  if (typeof actual !== 'string' || typeof expected !== 'string') return actual === expected;
  const normalize = (str) => {
    return str
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };
  return normalize(actual) === normalize(expected);
}

function spawnAndWait(command, args, cwd, stdinData = null) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd });
    let output = '';
    let runtimeError = '';
    let isTimeout = false;

    if (stdinData) {
      child.stdin.write(stdinData);
      child.stdin.end();
    }

    const timeoutTimer = setTimeout(() => {
      isTimeout = true;
      child.kill('SIGKILL');
    }, 5000);

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      runtimeError += data.toString();
    });

    child.on('error', (err) => resolve({ status: 'RE', details: 'Failed to start process: ' + err.message }));

    child.on('close', (code) => {
      clearTimeout(timeoutTimer);
      if (isTimeout) return resolve({ status: 'TLE' });
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
  const isStdio = problem.type === 'stdio';

  try {
    if (language === 'python') {
      const mainFile = path.join(tempDir, 'main.py');
      const pyCode = isStdio ? solutionCode : problem.generateMainPython(solutionCode, testCasesToRun);
      fs.writeFileSync(mainFile, pyCode);

      for (let i = 0; i < testCasesToRun.length; i++) {
        const tc = testCasesToRun[i];
        const pythonExecutable = os.platform() === 'win32' ? 'python' : 'python3';
        const args = isStdio ? ['main.py'] : ['main.py', i.toString()];
        const stdin = isStdio ? tc.input : null;
        const res = await spawnAndWait(pythonExecutable, args, tempDir, stdin);
        
        const formattedResult = { index: i + 1, isHidden: tc.isHidden, status: res.status };
        if (res.status === 'PASS') {
          if (compareOutput(res.actual, tc.expected, problem)) {
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
      const cCode = isStdio ? solutionCode : problem.generateMainC(solutionCode, testCasesToRun);
      fs.writeFileSync(mainFile, cCode);

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
          const args = isStdio ? [] : [i.toString()];
          const stdin = isStdio ? tc.input : null;
          const res = await spawnAndWait(exePath, args, tempDir, stdin);
          
          const formattedResult = { index: i + 1, isHidden: tc.isHidden, status: res.status };
          if (res.status === 'PASS') {
            if (compareOutput(res.actual, tc.expected, problem)) {
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
      const javaCode = isStdio ? solutionCode : problem.generateMain(solutionCode, testCasesToRun);
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
          const args = isStdio ? ['-Xmx256M', 'Main'] : ['-Xmx256M', 'Main', i.toString()];
          const stdin = isStdio ? tc.input : null;
          const res = await spawnAndWait('java', args, tempDir, stdin);
          
          const formattedResult = { index: i + 1, isHidden: tc.isHidden, status: res.status };
          if (res.status === 'PASS') {
            if (compareOutput(res.actual, tc.expected, problem)) {
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
