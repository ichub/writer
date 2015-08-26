function findPeriod(periodNumber, meta) {
    for (var i = 0; i < meta.courses.length; i++) {
        if (meta.courses[i].period == periodNumber) {
            return meta.courses[i];
        }
    }

    throw 'no period found';
}

module.exports = function(hb) {
    hb.registerHelper('heading', function(options) {
        if (typeof options.hash.period != 'undefined') {
            var course = findPeriod(options.hash.period, this);
            var n = '<br />';
            return this.author + n + 'Period ' + course.period + ' ' + course.name + n + course.teacher + n + new Date().toDateString() + n;
        }

        return 'error';
    });

    return hb;
};