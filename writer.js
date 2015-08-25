var fs = require('fs');

var args = process.argv.slice(2);

if (args.length == 0) {
    throw 'ERR: you must pass in a path to a file';
}

fs.readFile(args[0], 'utf8', function (err, data) {
    if (err) {
        throw err;
    }

    fs.writeFile('./compiled.html', data, function (err) {
        if (err) {
            throw err;
        }
    });
});