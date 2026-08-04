const fs = require('fs');

const code = `const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

function spawnAndWait(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd });
    let output = '';
    let runtimeError = '';
    let isTimeout = false;

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

    child.on('error', (err) => resolve({ status: 'FAIL', reason: 'Runtime Error', details: 'Failed to start process: ' + err.message }));

    child.on('close', (code) => {
      clearTimeout(timeoutTimer);
      if (isTimeout) return resolve({ status: 'FAIL', reason: 'Time Limit Exceeded' });
      if (code !== 0) return resolve({ status: 'FAIL', reason: 'Runtime Error', details: runtimeError });
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
      const pyCode = problem.generateMainPython(solutionCode, testCasesToRun);
      fs.writeFileSync(mainFile, pyCode);

      for (let i = 0; i < testCasesToRun.length; i++) {
        const tc = testCasesToRun[i];
        const res = await spawnAndWait('python3', ['main.py', i.toString()], tempDir);
        
        const formattedResult = { index: i + 1, isHidden: tc.isHidden, status: res.status };
        if (res.status === 'PASS') {
          if (res.actual === tc.expected) {
            passedCount++;
            formattedResult.status = 'PASS';
          } else {
            formattedResult.status = 'FAIL';
            formattedResult.reason = 'Wrong Answer';
          }
        }
        if (!tc.isHidden) {
          formattedResult.expected = tc.expected;
          formattedResult.actual = res.actual;
          formattedResult.reason = formattedResult.reason || res.reason;
          formattedResult.details = res.details;
        } else if (formattedResult.status === 'FAIL') {
          formattedResult.reason = 'Hidden Test Case Failed';
        }
        results.push(formattedResult);
      }
    } 
    else if (language === 'c') {
      const mainFile = path.join(tempDir, 'main.c');
      const cCode = problem.generateMainC(solutionCode, testCasesToRun);
      fs.writeFileSync(mainFile, cCode);

      const compRes = await compileCode('gcc', ['main.c', '-o', 'main'], tempDir);
      if (!compRes.success) {
        for (let i = 0; i < testCasesToRun.length; i++) {
          const formattedResult = {
            index: i + 1, isHidden: testCasesToRun[i].isHidden, status: 'FAIL', reason: 'Compilation Error'
          };
          if (!testCasesToRun[i].isHidden) formattedResult.details = compRes.error;
          else formattedResult.reason = 'Hidden Test Case Failed';
          results.push(formattedResult);
        }
      } else {
        const exePath = path.join(tempDir, os.platform() === 'win32' ? 'main.exe' : 'main');
        for (let i = 0; i < testCasesToRun.length; i++) {
          const tc = testCasesToRun[i];
          const res = await spawnAndWait(exePath, [i.toString()], tempDir);
          
          const formattedResult = { index: i + 1, isHidden: tc.isHidden, status: res.status };
          if (res.status === 'PASS') {
            if (res.actual === tc.expected) {
              passedCount++;
              formattedResult.status = 'PASS';
            } else {
              formattedResult.status = 'FAIL';
              formattedResult.reason = 'Wrong Answer';
            }
          }
          if (!tc.isHidden) {
            formattedResult.expected = tc.expected;
            formattedResult.actual = res.actual;
            formattedResult.reason = formattedResult.reason || res.reason;
            formattedResult.details = res.details;
          } else if (formattedResult.status === 'FAIL') {
            formattedResult.reason = 'Hidden Test Case Failed';
          }
          results.push(formattedResult);
        }
      }
    }
    else {
      // Java
      const mainFile = path.join(tempDir, 'Main.java');
      const javaCode = problem.generateMain(solutionCode, testCasesToRun);
      fs.writeFileSync(mainFile, javaCode);

      const compRes = await compileCode('javac', ['Main.java'], tempDir);
      if (!compRes.success) {
        for (let i = 0; i < testCasesToRun.length; i++) {
          const formattedResult = {
            index: i + 1, isHidden: testCasesToRun[i].isHidden, status: 'FAIL', reason: 'Compilation Error'
          };
          if (!testCasesToRun[i].isHidden) formattedResult.details = compRes.error;
          else formattedResult.reason = 'Hidden Test Case Failed';
          results.push(formattedResult);
        }
      } else {
        for (let i = 0; i < testCasesToRun.length; i++) {
          const tc = testCasesToRun[i];
          const res = await spawnAndWait('java', ['Main', i.toString()], tempDir);
          
          const formattedResult = { index: i + 1, isHidden: tc.isHidden, status: res.status };
          if (res.status === 'PASS') {
            if (res.actual === tc.expected) {
              passedCount++;
              formattedResult.status = 'PASS';
            } else {
              formattedResult.status = 'FAIL';
              formattedResult.reason = 'Wrong Answer';
            }
          }
          if (!tc.isHidden) {
            formattedResult.expected = tc.expected;
            formattedResult.actual = res.actual;
            formattedResult.reason = formattedResult.reason || res.reason;
            formattedResult.details = res.details;
          } else if (formattedResult.status === 'FAIL') {
            formattedResult.reason = 'Hidden Test Case Failed';
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
`;

fs.writeFileSync('backend/judge.js', code);
