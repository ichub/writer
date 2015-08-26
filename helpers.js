module.exports = function(hb) {
    hb.registerHelper('heading', function(options) {
        return 'Ivan Chub <br /> Period 3 English <br/> Mr. Foo <br/> Tue Aug 25, 2015';
    });

    return hb;
};