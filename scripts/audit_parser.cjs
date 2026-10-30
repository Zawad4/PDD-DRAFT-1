const fs = require('fs');

const serverContent = fs.readFileSync('server.js', 'utf8');
const lines = serverContent.split('\n');
const routes = [];

lines.forEach((line, idx) => {
  const match = line.match(/app\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/i);
  if (match) {
    routes.push({
      line: idx + 1,
      method: match[1].toUpperCase(),
      path: match[2]
    });
  }
});

console.log(`Discovered ${routes.length} API routes in server.js:\n`);
routes.forEach((r, i) => {
  console.log(`${(i + 1).toString().padStart(2, '0')}. [${r.method.padEnd(6)}] ${r.path.padEnd(35)} (Line ${r.line})`);
});

