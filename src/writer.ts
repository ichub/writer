var fs = require('fs');
var compiler = require('./compiler');

var args = process.argv.slice(2);

var content = fs.readFileSync(args[0], 'utf8');
var template = fs.readFileSync('content/template.hbs', 'utf8');
var style = fs.readFileSync('styles/stylus/style.scss', 'utf8');
var metadata = JSON.parse(fs.readFileSync(args[1], 'utf8'));

compiler(template, content, style, metadata);
