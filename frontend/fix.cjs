const fs = require('fs');
const path = require('path');

const dirs = ['src/pages', 'src/store', 'src'];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    fs.readdirSync(fullPath).forEach(file => {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        let p = path.join(fullPath, file);
        let content = fs.readFileSync(p, 'utf8');
        let original = content;
        content = content.replace(/\\\`/g, '\`').replace(/\\\$\{/g, '${');
        if(original !== content) {
          fs.writeFileSync(p, content);
          console.log('Fixed', p);
        }
      }
    });
  }
});
