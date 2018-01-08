const mailConfig = require('./../config/config').mailConfig;
const nodemailer = require('nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');

// console.log('mail.js, mailConfig: ', mailConfig);

const fromAddress = mailConfig.fromAddress;
const replyToAddress = mailConfig.replyToAddress;
const host = 'localhost';
const port = 25;

function sendMail (templateData, templateFile, toAddress, subject) {
  let template = handlebars.compile(templateFile);
  let result = template(templateData);

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: fromAddress,
    replyTo: replyToAddress,
    to: toAddress,
    subject: subject,
    html: result
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('error sending mail: ', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });

}

module.exports = {
  sendMail
}

