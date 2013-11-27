/*
 * DB Module.
 */
var db;
var mysql = require('mysql'),
    poolModule = require('generic-pool'),
    dbhost = "localhost",
    dbuser = "root",
    dbpassword = "root",
    dbdatabase = "eeeeemail";

    var db = poolModule.Pool({
      name     : 'mysql',
      create   : function(callback) {
          var c = mysql.createConnection({
                    host: dbhost,
                    user: dbuser,
                    password: dbpassword,
                    database: dbdatabase
                  });
          c.connect();
          callback(null, c);
      },
      destroy  : function(client) { client.end(); },
      max      : 10,
      idleTimeoutMillis : 20000,
      log : false
    });

//export query
exports.query = function(qry, values, callback) {
  db.acquire(function(err, connection) {
    connection.query(qry, values, function(err, results, fields) { 
      // console.log(err);
      db.release(connection);          
      if(results instanceof Array) {
        if(results.length > 0) {
          callback(results);
        } else {
          callback(null);
        }
      } else {  
        callback(results);
      }
    });
  });
};