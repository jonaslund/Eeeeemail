/*
 * Mailer Module.
 */
var nodemailer = require("nodemailer");

exports.mail = function(email, subject, message) {
  var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: SEND_EMAIL,
        pass: SEND_PASSWORD
    }
  });
  
 var mailOptions = {
      from: "Eeeeemail ✔ <email@your-domain.com>", // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      text: message
  };

  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log(error);
    }else{
      console.log("Message sent: " + response.message);
    }

    smtpTransport.close();
  });
};