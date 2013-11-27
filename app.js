/*
Eeeeemail.com
Jonas Lund & Michelle You

 */

var express = require('express'),
    http = require('http'),    
    app = express(),
    path = require("path"),
    common = require("./lib/common"),
    pool = require("./lib/db"),
    mailer = require("./lib/mailer"),
    server = http.createServer(app),
    OAuth = require('oauth').OAuth,
    MailParser = require("mailparser").MailParser,
    querystring = require('querystring'),
    Imap = require('imap'),
    inspect = require('util').inspect,
    xoauth2 = require("xoauth2"),
    xoauth2gen,
    googleapis = require('googleapis'),
    OAuth2Client = googleapis.OAuth2Client;

var CLIENT_ID = "", 
    CLIENT_SECRET = "", 
    REDIRECT_URL = "";

//app.use(express.logger());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
  secret: "skjghskdjfhbqigohqdiouk"
}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Home Page
app.get('/', function(req, res){
  if(!req.session.oauth_access_token) {
    res.render("home");
  }
  else {
    res.render("dohome");
  }

});

app.get("/eeeeemail", require_google_login, function(req ,res) {
  res.render("dohome");
});

app.get("/begin", function(req, res) {
  var email = req.query.email;
  
  req.session.email = email;
  res.redirect("/login");  
});

app.get("/login", function(req, res) {
  var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    approval_prompt: 'force',
    scope: 'https://mail.google.com/'
  });

  res.redirect(url);  
});

app.get("/oauth2callback", function(req, res) {
  var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);  
  var code = req.query.code;

  oauth2Client.getToken(code, function(err, tokens) {
    console.log("tokens", tokens);
    if(tokens !== null) {
      req.session.access_token = tokens.access_token;
      req.session.refresh_token = tokens.refresh_token;
      res.redirect("/eeeeemail");
    
    } else {
      res.redirect("/");
    }

  });
});


app.get('/doemail', require_google_login, function(req, res) {

    pool.query("SELECT * FROM people WHERE email = ? AND refreshtoken = ?", [req.session.email,  req.session.refresh_token], function(already) {
      if(already) {
        res.render("waitingtobesent", {
          eheader: already[0].emailheader, 
          email: already[0].emailtosend                              
        });

      } else {
        //do do do

      xoauth2gen = xoauth2.createXOAuth2Generator({
        user: req.session.email,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: req.session.refresh_token
      });

      xoauth2gen.getToken(function(err, token){
        if(err) {
          console.log(err);
          res.render("error", {
            error: "Uopssi, little problem"
          });

          //res.json("Uopssi, little problem");
        } else {

          //console.log("AUTH XOAUTH2 " + token);

          var imap = new Imap({
            user: req.session.email,      
            xoauth2: token,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }
          });

          imap.once('error', function(err) {
            console.log("imap error", err);
            res.render("error", {
              error: "Opsi, connection probs, please try again later"
            });
                        
            //res.json("Opsi, connection probs, please try again later");
          });

          imap.once('end', function() {
            //console.log('Connection ended');
            //res.render("done");
          });


          //language issue here
          function openInbox(cb) {
            imap.openBox('[Gmail]/Sent Mail', true, cb);
          }

          imap.once('ready', function() {
            // imap.getBoxes(function(err, boxes) {
            //   console.log(boxes);
            // });

            openInbox(function(err, box) {

              if (err)  {
                //res.json("Opps, language difficultures");
                res.render("error", {
                  error: "Opps, language difficultures"
                });
          
              } else {
                
                var total = box.messages.total;          
                var theemail = Math.floor(Math.random()*total)+1;          

                console.log("fetch one", theemail);

                var f = imap.fetch(theemail, {
                  //id: 1,
                  bodies: ['HEADER.FIELDS (SUBJECT)', 'TEXT'],
                  struct: true
                });

                f.on('message', function(msg, seqno) {
                  var body = '';
                  var header = '';

                  //console.log('Message #%d', seqno);
                  //var prefix = '(#' + seqno + ') ';
                  msg.on('body', function(stream, info) {
                    if(info.which === "TEXT") {
                      
                      stream.on('data', function(chunk) {
                        body += chunk.toString('utf8');
                      });

                      stream.once('end', function() {

                        mailparser = new MailParser();

  //                      console.log("body", body);

                        mailparser.on("end", function(mail_object){
                          var emailtext = "";
//                          console.log(mail_object);

                          if(mail_object.text === undefined) {
                            emailtext = mail_object.headers.toString().replace(/(<([^>]+)>)/ig, "");
                            // console.log("EMAIL", emailtext);
                            // console.log("mailobject", mail_object.headers.toString());

                          } else {
                            emailtext = mail_object.text;
                          }


                          //var links = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                          var links = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gim;
                          var emails = /(["'>:]?)([\w.-]+@[\w.-]+\.[\w.-]+)/gi;
                          
                          var noLinks = emailtext.toString().replace(links, "http://eeeeemail.com");
                          var noLinkNoEmails = noLinks.replace(emails, "eeeeeeeeeeeeeeeeeeemail@gmail.com");

                          //find first occurance of \n>                          
                          noLinkNoEmails = noLinkNoEmails.substring(0, noLinkNoEmails.indexOf('\n>'));

                          pool.query("INSERT INTO people SET emailtosend = ?, email = ?, refreshtoken = ?", [noLinkNoEmails, req.session.email, req.session.refresh_token], function() {
                            console.log("inserted body");
                          });

                        });

                        mailparser.write(body);
                        mailparser.end();

                      });

                    } else {
                      stream.on('data', function(chunk) {
                        header += chunk.toString('utf8');
                      });

                      stream.once('end', function() {                                                    
                        mailparser = new MailParser();
                        mailparser.on("end", function(mail_object){
                                                  
                          pool.query("UPDATE people SET emailheader = ? WHERE email = ?", [mail_object.subject, req.session.email], function() {
                            
                            console.log("inserted header");

                            //do the processing here          
                            //get the first free one thats no yourself              
                            pool.query("SELECT * FROM people WHERE done=0 AND email != ? AND emailtosend IS NOT NULL LIMIT 1", [req.session.email], function(emails){
                              if(emails) {                                

                                //send to one                  
                                mailer.mail(req.session.email, emails[0].emailheader, emails[0].emailtosend);
                                var othermail = emails[0].email;
                                var firstmail = req.session.email;

                                pool.query("SELECT * FROM people WHERE email = ?", [req.session.email], function(emailtwo) {
                                  //send to the other                  

                                  //log out user
                                  req.session.refresh_token = "";
                                  req.session.access_token = "";
                                  req.session.email = ""; 

                                  console.log(emailtwo);

                                  res.render("done", {
                                    eheader: emailtwo[0].emailheader, 
                                    email: emailtwo[0].emailtosend                            
                                  });

                                  mailer.mail(othermail, emailtwo[0].emailheader, emailtwo[0].emailtosend);

                                  pool.query("DELETE FROM people WHERE email IN (?)", [[othermail, firstmail]], function(done) {
                                    console.log("DONE");                                    
                                  });
                                });
                                
                              } else {
                                pool.query("SELECT * FROM people WHERE email = ? AND refreshtoken = ?", [req.session.email, req.session.refresh_token], function(emailtwo) {
                                  
                                  res.render("done", {
                                    eheader: emailtwo[0].emailheader,
                                    email: emailtwo[0].emailtosend
                                  });

                                });

                                console.log("you're last in line");
                              }
                            });
                          });                      
                        });

                        mailparser.write(header);
                        mailparser.end();

                      });                
                    }
                  });

                  msg.once('end', function() {
                    console.log('Finished');              
                  });
                
                });
                f.once('error', function(err) {
                  console.log('Fetch error: ' + err);
                });
                f.once('end', function() {
                  console.log('Done fetching all messages!');
                  imap.end();
                });
              } 
            });            
            
          });          
          imap.connect();        
          }
        });
      }

  });
  
});

function require_google_login(req, res, next) {
  if(!req.session.access_token || !req.session.refresh_token) {
    res.redirect("/login");
    return;
  }
  next();
}


server.listen(7000, function(){
  console.log("Express server listening on port 7000 in " + app.get('env'));
});