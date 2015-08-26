var fs = require('fs');
var hb = require('./helpers')(require('handlebars'));

var args = process.argv.slice(2);

if (args.length == 0) {
    throw 'ERR: you must pass in a path to a file';
}

fs.readFile(args[0], 'utf8', function (err, data) {
    if (err) {
        throw err;
    }

    var template = hb.compile(data);
    var compiled = template({});

    fs.writeFile('./compiled.html', compiled, function (err) {
        if (err) {
            throw err;
        }
    });
});