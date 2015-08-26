var fs = require('fs');

var metaText = fs.readFileSync(process.argv[3], 'utf8');

module.exports = JSON.parse(metaText);
