/*
 * Common Functions
 */
exports.ensureAuthenticated = function(req, res, next) {
  console.log("ensureAuthenticated");
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

exports.puts = function(error, stdout, stderr) { 
  util.puts(stdout); 
};

exports.extname = function(path) {
  var index = path.lastIndexOf(".");
  return index < 0 ? "" : path.substring(index);
};

exports.validateEmail = function (email) { 
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

exports.is_numeric = function(mixed_var) {
  return (typeof(mixed_var) === 'number' || typeof(mixed_var) === 'string') && mixed_var !== '' && !isNaN(mixed_var);
};

exports.GUID = function() {
  var now = new Date();
  var d = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

  var S4 = function () {
    return Math.floor(Math.random() * 0x10000).toString(16);
  };

  return (
    d +
    S4() + S4() + "-" +
    S4() + "-" +
    S4() + "-" +
    S4() + "-" +
    S4() + S4() + S4()
  );
};

exports.inArray = function(needle, haystack) {
  var length = haystack.length;
  for(var i = 0; i < length; i++) {
      if(haystack[i] == needle) return true;
  }
  return false;
};


exports.mysqlTimeStampToDate = function(timestamp) {
  var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
  var parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
  return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
};

exports.addslashes = function(str) {
  str=str.replace(/\\/g,'\\\\');
  str=str.replace(/\'/g,'\\\'');
  str=str.replace(/\"/g,'\\"');
  str=str.replace(/\0/g,'\\0');
  return str;
};

exports.removeA = function(arr) {  
  var what, a = arguments, L = a.length, ax;
  while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax= arr.indexOf(what)) !== -1) {
          arr.splice(ax, 1);
      }
  }
  return arr;
  
};