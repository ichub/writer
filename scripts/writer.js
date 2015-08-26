var fs = require('fs');
var hb = require('./helpers')(require('handlebars'));
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

                    pdf.create(compiled, {
                        width: '8.5in',
                        height: '11in'
                    }).toFile('./compiled.pdf', function(err, res) {
                        if (err) {
                            throw err;
                        }


                    });
                });
            });
        });
    });
});