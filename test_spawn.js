const { spawn } = require('child_process');
const py = spawn('nonexistent_command', ['test']);

py.on('error', (err) => {
  console.log('error emitted', err.message);
});

py.on('close', (code) => {
  console.log('close emitted', code);
});

py.stdout?.on('data', (d) => console.log('stdout', d.toString()));
py.stderr?.on('data', (d) => console.log('stderr', d.toString()));
