const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

/**
 * Runs a single test case for a given problem and code.
 */
function runTestCase(solutionCode, testCase, problem, language = 'java') {
  return new Promise((resolve) => {
    // 1. Create a unique temp directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'judge-'));

    if (language === 'python') {
      const mainFile = path.join(tempDir, 'main.py');
      const pyCode = problem.generateMainPython(solutionCode, testCase);
      fs.writeFileSync(mainFile, pyCode);
      
      const py = spawn('python', ['main.py'], { cwd: tempDir });
      py.on('error', (err) => resolve({ status: 'FAIL', reason: 'Runtime Error', details: 'Failed to start python: ' + err.message }));
      
      let output = '';
      let runtimeError = '';
      let isTimeout = false;

      const timeoutTimer = setTimeout(() => {
        isTimeout = true;
        py.kill('SIGKILL');
      }, 5000);

      py.stdout.on('data', (data) => {
        output += data.toString();
      });

      py.stderr.on('data', (data) => {
        runtimeError += data.toString();
      });

      py.on('close', (code) => {
        clearTimeout(timeoutTimer);
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}

        if (isTimeout) return resolve({ status: 'FAIL', reason: 'Time Limit Exceeded' });
        if (code !== 0) return resolve({ status: 'FAIL', reason: 'Runtime Error', details: runtimeError });

        const actualOutput = output.trim();
        if (actualOutput === testCase.expected) {
          return resolve({ status: 'PASS', actual: actualOutput, expected: testCase.expected });
        } else {
          return resolve({ status: 'FAIL', reason: 'Wrong Answer', actual: actualOutput, expected: testCase.expected });
        }
      });
      return;
    }

    if (language === 'c') {
      const mainFile = path.join(tempDir, 'main.c');
      const cCode = problem.generateMainC(solutionCode, testCase);
      fs.writeFileSync(mainFile, cCode);
      
      const gcc = spawn('gcc', ['main.c', '-o', 'main'], { cwd: tempDir });
      gcc.on('error', (err) => resolve({ status: 'FAIL', reason: 'Compilation Error', details: 'Failed to start gcc: ' + err.message }));
      
      let compileError = '';
      gcc.stderr.on('data', (data) => {
        compileError += data.toString();
      });
      
      gcc.on('close', (code) => {
        if (code !== 0) {
          try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch(e){}
          return resolve({ status: 'FAIL', reason: 'Compilation Error', details: compileError });
        }
        
        const exePath = path.join(tempDir, os.platform() === 'win32' ? 'main.exe' : 'main');
        const cRun = spawn(exePath, [], { cwd: tempDir });
        cRun.on('error', (err) => resolve({ status: 'FAIL', reason: 'Runtime Error', details: 'Failed to start C executable: ' + err.message }));
        
        let output = '';
        let runtimeError = '';
        let isTimeout = false;
        
        const timeoutTimer = setTimeout(() => {
          isTimeout = true;
          cRun.kill('SIGKILL');
        }, 5000);
        
        cRun.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        cRun.stderr.on('data', (data) => {
          runtimeError += data.toString();
        });
        
        cRun.on('close', (code) => {
          clearTimeout(timeoutTimer);
          try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
          
          if (isTimeout) return resolve({ status: 'FAIL', reason: 'Time Limit Exceeded' });
          if (code !== 0) return resolve({ status: 'FAIL', reason: 'Runtime Error', details: runtimeError });
          
          const actualOutput = output.trim();
          if (actualOutput === testCase.expected) {
            return resolve({ status: 'PASS', actual: actualOutput, expected: testCase.expected });
          } else {
            return resolve({ status: 'FAIL', reason: 'Wrong Answer', actual: actualOutput, expected: testCase.expected });
          }
        });
      });
      return;
    }

    // Java execution
    const mainFile = path.join(tempDir, 'Main.java');

    // 2. Generate the Main.java content
    const javaCode = problem.generateMain(solutionCode, testCase);

    // 3. Write to file
    fs.writeFileSync(mainFile, javaCode);

    // 4. Compile the code
    const javac = spawn('javac', ['Main.java'], { cwd: tempDir });
    javac.on('error', (err) => resolve({ status: 'FAIL', reason: 'Compilation Error', details: 'Failed to start javac: ' + err.message }));

    let compileError = '';
    javac.stderr.on('data', (data) => {
      compileError += data.toString();
    });

    javac.on('close', (code) => {
      if (code !== 0) {
        // Compilation failed
        fs.rmSync(tempDir, { recursive: true, force: true });
        return resolve({
          status: 'FAIL',
          reason: 'Compilation Error',
          details: compileError
        });
      }

      // 5. Run the code
      const java = spawn('java', ['Main'], { cwd: tempDir });
      java.on('error', (err) => resolve({ status: 'FAIL', reason: 'Runtime Error', details: 'Failed to start java: ' + err.message }));
      
      let output = '';
      let runtimeError = '';
      let isTimeout = false;

      // Set timeout
      const timeoutTimer = setTimeout(() => {
        isTimeout = true;
        java.kill('SIGKILL');
      }, 5000);

      java.stdout.on('data', (data) => {
        output += data.toString();
      });

      java.stderr.on('data', (data) => {
        runtimeError += data.toString();
      });

      java.on('close', (code) => {
        clearTimeout(timeoutTimer);
        
        // Clean up temp dir
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          console.error('Error cleaning up temp dir', e);
        }

        if (isTimeout) {
          return resolve({
            status: 'FAIL',
            reason: 'Time Limit Exceeded'
          });
        }

        if (code !== 0) {
          return resolve({
            status: 'FAIL',
            reason: 'Runtime Error',
            details: runtimeError
          });
        }

        const actualOutput = output.trim();
        if (actualOutput === testCase.expected) {
          return resolve({
            status: 'PASS',
            actual: actualOutput,
            expected: testCase.expected
          });
        } else {
          return resolve({
            status: 'FAIL',
            reason: 'Wrong Answer',
            actual: actualOutput,
            expected: testCase.expected
          });
        }
      });
    });
  });
}

module.exports = {
  runTestCase
};
