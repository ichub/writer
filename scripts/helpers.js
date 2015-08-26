var metadata = require('./metadata');

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
        if (typeof that[contextVarName] != "object") {
            for (var param in options.hash) {
                var pathToObj = path == '' ? contextVarName : path + '.' + contextVarName;
                options.hash[param] = options.hash[param].replace('{{' + pathToObj + '}}', that[contextVarName]);
            }
        } else {
            preprocessHash(that[contextVarName], options, path == '' ? contextVarName : '.' + contextVarName);
        }
    }
}

module.exports = function (hb, printInfo) {
    hb.registerHelper('heading', function (options) {
        if (typeof options.hash.period != 'undefined') {
            var course = findPeriod(options.hash.period, this);
            var n = '<br />';
            return '<span class="mla_heading">' +
                this.name.full + n + 'Period ' + course.period + ' ' + course.name + n + course.teacher + n + new Date().toDateString() + n +
                '</span>';
        }

        return 'error';
    });

    hb.registerHelper('document', function (options) {
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

    hb.registerHelper('header', function (options) {
        preprocessHash(this, options);
        var align = options.hash.align || 'center';

        printInfo.header = {
            contents: '<div class="header" style="text-align:' + align + '">' + options.hash.text + '</div>',
            height: options.hash.height || '1cm'
        };
    });

    hb.registerHelper('footer', function (options) {
        var align = options.hash.align || 'center';

        printInfo.footer = {
            contents: '<div class="header" style="text-align:' + align + '">' + options.hash.text + '</div>',
            height: options.hash.height || '1cm'
        };
    });

    return hb;
};