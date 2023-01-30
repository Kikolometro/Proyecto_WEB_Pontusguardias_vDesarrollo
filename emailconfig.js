var nodemailer = require('nodemailer');
const inputs = require(__dirname + "/inputs.js");
const pass = inputs.pass;
const email = inputs.email;


// Create the transporter with the required configuration for Outlook
// change the user and pass !
exports.transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
       ciphers:'SSLv3',
       rejectUnauthorized: false
    },
    auth: {
        user: email,
        pass: pass    }
});

// setup e-mail data, even with unicode symbols
//mailOptions = {
//    from: email, // sender address (who sends)
//    to: 'kiko_salvador@hotmail.com', // list of receivers (who receives)
//    subject: 'Hello ', // Subject line
//    text: 'Hello world ', // plaintext body
//    html: '<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js', // html body
//    attachments: [
          //{   // utf-8 string as an attachment
          //    filename: 'text1.txt',
          //    content: 'hello world!'
          //},
          //{   // binary buffer as an attachment
          //    filename: 'text2.txt',
          //    content: new Buffer('hello world!','utf-8')
          //},
//          {   // file on disk as an attachment
//              filename: 'datos_534982.txt',
//              path: __dirname + '/exports/datos_534982.txt' // stream this file
//          }
          //{   // filename and content type is derived from path
          //    path: '/exports/file.txt'
          //},
          //{   // stream as an attachment
          //    filename: 'text4.txt',
          //    content: fs.createReadStream('file.txt')
          //},
          //{   // define custom content type for the attachment
          //    filename: 'text.bin',
          //    content: 'hello world!',
          //    contentType: 'text/plain'
          //},
          //{   // use URL as an attachment
          //    filename: 'license.txt',
          //    path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE'
          //},
          //{   // encoded string as an attachment
          //    filename: 'text1.txt',
          //    content: 'aGVsbG8gd29ybGQh',
          //    encoding: 'base64'
          //},
          //{   // data uri as an attachment
          //    path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
          //}
//      ]
//};
