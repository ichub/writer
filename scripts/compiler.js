var fs = require('fs');
var hb = require('handlebars');
var katex = require('katex');
var marked = require('marked');
var pdf = require('html-pdf');
var sass = require('node-sass');

function findPeriod(periodNumber, meta) {
    for (var i = 0; i < meta.courses.length; i++) {
        if (meta.courses[i].period == periodNumber) {
            return meta.courses[i];
        }
    }

    throw 'no period found';
}

function preprocessHash(that, options, path) {
    path = path || '';

    for (var contextVarName in that) {
        if (!Array.isArray(that[contextVarName])) {
            if (typeof that[contextVarName] != 'object') {
                for (var param in options.hash) {
                    if (typeof options.hash[param] == 'string') {
                        var pathToObj = path == '' ? contextVarName : path + '.' + contextVarName;
                        options.hash[param] = options.hash[param].replace('{{' + pathToObj + '}}', that[contextVarName]);
                    }
                }
            } else {
                preprocessHash(that[contextVarName], options, path == '' ? contextVarName : '.' + contextVarName);
            }
        }
    }
}


function addHelper(name, helper) {
    hb.registerHelper(name, function (options) {
        preprocessHash(this, options);

        return helper.apply(this, arguments);
    });
}

addHelper('heading', function (options) {
    if (typeof options.hash.period != 'undefined') {
        var course = findPeriod(options.hash.period, this);
        var n = '<br />';
        return '<span class="mla_heading">' +
            this.name.full + n + 'Period ' + course.period + ' ' + course.name + n + course.teacher + n + new Date().toDateString() + n +
            '</span>';
    }

    return 'error';
});

addHelper('document', function (options) {
    for (prop in options.hash) {
        if (prop == 'margin') {
            printInfo['border'] = {
                top: options.hash[prop],
                right: options.hash[prop],
                bottom: options.hash[prop],
                left: options.hash[prop]
            }
        } else {
            printInfo[prop] = options.hash[prop];
        }
    }
});

addHelper('header', function (options) {
    var align = options.hash.align || 'center';

    printInfo.header = {
        contents: '<div class="header" style="text-align:' + align + '">' + options.hash.text + '</div>',
        height: options.hash.height || '1cm'
    };
});

addHelper('footer', function (options) {
    var align = options.hash.align || 'center';

    printInfo.footer = {
        contents: '<div class="header" style="text-align:' + align + '">' + options.hash.text + '</div>',
        height: options.hash.height || '1cm'
    };
});

addHelper('math', function (options) {
    return katex.renderToString('\\int_2^5 x^2');
});

var printInfo = {};
function compileDocument(template, content, style, metadata) {
    var contentTemplate = hb.compile(content);
    var templateTemplate = hb.compile(template);

    var body = contentTemplate(metadata);
    body = marked(body);

    var compiledStyle = sass.renderSync({
        file: './styles/stylus/style.scss',
        includePaths: [
            './styles/stylus/'
        ]
    }).css;

    var compiledHtml = templateTemplate({
        body: body,
        style: '<style>\n' + compiledStyle + '</style>'
    });

    pdf.create(compiledHtml, printInfo).toFile('./compiled.pdf', function (err, buf) {
        prinInfo = {};
    });

    fs.writeFileSync('./compiled.html', compiledHtml);
}

module.exports = compileDocument;