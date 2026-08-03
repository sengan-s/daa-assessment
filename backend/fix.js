const fs = require('fs');

['index.js', 'problems.js'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\`/g, '\`').replace(/\\\$\{/g, '${');
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
