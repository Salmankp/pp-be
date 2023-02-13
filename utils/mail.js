const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  // host: process.env.MAIL_HOST,
  service:"gmail",
  // port: 465,
  secure: true, // use TLS
  auth: {
    user: process.env.MAIL_AUTH_USER?.toString(),
    pass: process.env.MAIL_AUTH_PASSWORD?.toString(),
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

module.exports = transport;