const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'dist');

function rimraf(d) {
  if (!fs.existsSync(d)) return;
  const files = fs.readdirSync(d);
  for (const f of files) {
    if (fs.statSync(path.join(d, f)).isDirectory()) {
      rimraf(path.join(d, f));
    } else {
      let fp = path.join(d, f);
      fs.unlinkSync(fp);
    }
  }
  fs.rmdirSync(d);
}

rimraf(dir);
