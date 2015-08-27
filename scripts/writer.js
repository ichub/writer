var fs = require('fs');
var printOptions = {};
var hb = require('./helpers')(require('handlebars'), printOptions);
var marked = require('marked');
var pdf = require('html-pdf');

var args = process.argv.slice(2);

var userContent = fs.readFileSync(args[0], 'utf8');
var metadata = JSON.parse(fs.readFileSync(args[1], 'utf8'));

var template = fs.readFileSync('content/template.hbs', 'utf8');

var contentTemplate = hb.compile(userContent);
var templateTemplate = hb.compile(template);

var style = fs.readFileSync('styles/stylus/style.css', 'utf8');

var body = contentTemplate(metadata);
body = marked(body);

var compiled = templateTemplate({
    body: body,
    style: '<style>\n' +
    style +
    '</style>'
});

fs.writeFileSync('compiled.html', compiled);

pdf.create(compiled, printOptions).toFile('./compiled.pdf', function (err, res) {
});