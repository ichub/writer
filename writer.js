var fs = require('fs');
var hb = require('./helpers')(require('handlebars'));

var args = process.argv.slice(2);

if (args.length == 0) {
    throw 'ERR: you must pass in a path to a file';
}

fs.readFile(args[0], 'utf8', function (err, userContent) {
    if (err) {
        throw err;
    }

    fs.readFile('./template.hbs', 'utf8', function(err, templateContent) {
        var templateTemplate = hb.compile(templateContent);
        var contentTemplate = hb.compile(userContent);

        var compiled = templateTemplate({
            body: contentTemplate({})
        });

        fs.writeFile('./compiled.html', compiled, function (err) {
            if (err) {
                throw err;
            }
        });
    });
});