module.exports = function(hb) {
    hb.registerHelper("test", function(options) {
        return '<span style="color:red">TEST</span>';
    });

    return hb;
};