## Eeeeemail.com
Jonas Lund & Michelle You

Made for the Rhizome's [7on7 event at Barbican in London](http://rhizome.org/sevenonseven), keep in mind, it was written under pretty high stress levels :)

## About

Eeeeemail will randomly select one email from your Gmail Sent Mail folder and send that to another eeeemailer. In exchange, you will receive a randomly selected email from that person. 

We remove all email addresses before forwarding the email. We’ll show you which email we’ve sent, but you can’t undo it. 

You’ll be sent to to Google to give us access to your Sent Mail folder.

[eeeeemail.com](eeeeemail.com)

### How to run
* update app.js CLIENT_ID, CLIENT_SECRET, REDIRECT_URL with your own google credentials
* update lib/mailer.js with SEND_EMAIL, SEND_PASSWORD
* create/connect to mysql database
* npm install
* node app.js