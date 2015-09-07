var fs = require('fs');
var hb = require('handlebars');
var katex = require('katex');
var marked = require('marked');
var pdf = require('html-pdf');
var sass = require('node-sass');
var bibtex = require('bibtex-parser');

// helperType can be one of: ['input', 'output']
function HelperInfo(name, helperType) {
  this.name = name;
  this.helperType = helperType;
}

HelperInfo.data = {};

HelperInfo.prototype.getData = function () {
  if (this.helperType == 'output') {
    throw new Error('The helper\"' + this.name + '\" does not provide data because it is an output helper');
  }

  return HelperInfo.data[this.name];
};

HelperInfo.prototype.setData = function (data) {
  if (this.helperType == 'output') {
    throw new Error('The data of helper\"' + this.name + '\" cannot be set because it is an output helper');
  }

  HelperInfo.data[this.name] = data;
};

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

  return new HelperInfo(name);
}

function addInputPassHelper(name, helper) {
  var info = new HelperInfo(name, 'input');

  addHelper(name, function () {
    if (isFirstPass) {
      var data = helper.apply(this, arguments);

      info.setData(data);
    }

    return '';
  });

  return info;
}

function addOutputPassHelper(name, helper) {
  addHelper(name, function () {
    if (!isFirstPass) {
      return helper.apply(this, arguments);
    }

    return identityHelper(name).apply(this, arguments);
  });

  return new HelperInfo(name, 'output');
}

function identityHelper(name) {
  return function (options) {
    var result = '{{{' + name + ' ';

    for (var prop in options.hash) {
      result += prop + '=\"' + options.hash[prop].toString() + '\" ';
    }

    result += '}}}';

    return result;
  }
}

var heading = addOutputPassHelper('heading', function (options) {
  if (typeof options.hash.period != 'undefined') {
    var course = findPeriod(options.hash.period, this);
    var n = '<br />';
    return '<span class="mla_heading">' +
      this.name.full + n + 'Period ' + course.period + ' ' + course.name + n + course.teacher + n + new Date().toDateString() + n +
      '</span>';
  }

  return 'error';
});

var document = addInputPassHelper('document', function (options) {
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

var header = addInputPassHelper('header', function (options) {
  var align = options.hash.align || 'center';

  printInfo.header = {
    contents: '<div class="header" style="text-align:' + align + '">' + options.hash.text + '</div>',
    height: options.hash.height || '1cm'
  };
});

var footer = addInputPassHelper('footer', function (options) {
  var align = options.hash.align || 'center';

  printInfo.footer = {
    contents: '<div class="header" style="text-align:' + align + '">' + options.hash.text + '</div>',
    height: options.hash.height || '1cm'
  };
});

var math = addOutputPassHelper('math', function (options) {
  return katex.renderToString('\\int_2^5 x^2');
});

var image = addOutputPassHelper('image', function (options) {
  var image = fs.readFileSync(options.hash.file);
  var base64Image = new Buffer(image, 'binary').toString('base64');

  return '<img src="' + 'data:image/jpg;base64,' + base64Image + '"/>'
});

var ref = addOutputPassHelper('ref', function (options) {
  var bibData = bibliography_info.getData();
  for (var i = 0; i < bibData.length; i++) {
    if (bibData[i].key == options.hash.key.toUpperCase()) {
      return '<span class="reference">[' + (i + 1) + ']</span>';
    }
  }

  throw new Error('No bibliography entry with key \"' + options.hash.key + '\" exists')
});

var new_page = addOutputPassHelper('new_page', function (options) {
  return '<div style="page-break-after: always"></div>';
});

function valOrEmpty(val, other) {
  return val == undefined ? '' : val + other;
}

function mlaFormatBibEntry(data) {
  return valOrEmpty(data.AUTHOR, '. ') +
    '<em>' +
    valOrEmpty(data.TITLE, '. ') +
    '</em> ' +
    valOrEmpty(data.ADDRESS, ': ') +
    valOrEmpty(data.PUBLISHER, ', ') +
    valOrEmpty(data.YEAR, '. ') +
    valOrEmpty(data.MEDIUM, '.');
}

var bibliography_info = addInputPassHelper('bibliography_info', function (options) {
  var bibtexText = fs.readFileSync('./bibtex.txt', 'utf8');
  var bib = bibtex(bibtexText);

  var entries = [];

  for (var prop in bib) {
    entries.push({
      key: prop,
      data: bib[prop]
    });
  }
  return entries;
});

var bibliography = addOutputPassHelper('bibliography', function (options) {
  var entries = bibliography_info.getData();

  var mlaFormattedEntries = entries.map(function (entry) {
    return mlaFormatBibEntry(entry.data);
  });

  mlaFormattedEntries.sort();

  var result = '<ol class="bibliography">';
  mlaFormattedEntries.forEach(function (item) {
    result += '<li>' + item + '</li>';
  });

  result += '</ol>';

  return result;
});

var printInfo = {};
var isFirstPass = true;

function compileDocument(template, content, style, metadata) {
  var contentTemplate = hb.compile(content);
  var templateTemplate = hb.compile(template);

  var body = contentTemplate(metadata);

  isFirstPass = false;

  body = hb.compile(body)(metadata);
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
    printInfo = {};
  });

  fs.writeFileSync('./compiled.html', compiledHtml);
}

module.exports = compileDocument;