var fs = require('fs');
var printOptions = {};
var hb = require('./helpers')(require('handlebars'), printOptions);
var pdf = require('html-pdf');

var args = process.argv.slice(2);

if (args.length == 0) {
    throw 'ERR: you must pass in a path to a file';
}

fs.readFile(args[0], 'utf8', function (err, userContent) {
    if (err) {
        throw err;
    }

    fs.readFile(args[1], 'utf8', function(err, metadata) {
        var meta = JSON.parse(metadata);

        fs.readFile('content/template.hbs', 'utf8', function(err, templateContent) {
            var templateTemplate = hb.compile(templateContent);
            var contentTemplate = hb.compile(userContent);

            fs.readFile('styles/style.css', 'utf8', function(err, style) {
                var compiled = templateTemplate({
                    body: contentTemplate(meta),
                    style: '<style>\n' +
                            style +
                           '</style>'
                });

                fs.writeFile('compiled.html', compiled, function (err) {
                    if (err) {
                        throw err;
                    }

                    pdf.create(compiled, printOptions).toFile('./compiled.pdf', function(err, res) {
                        if (err) {
                            throw err;
                        }
                    });
                });
            });
        });
    });
});