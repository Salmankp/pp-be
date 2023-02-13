
const client = require("twilio")(
    process.env.ACCOUNT_SID,
    process.env.AUTH_TOKEN
  );
const transport = require("../utils/mail");
const fs = require("fs");
const path = require("path");
const handlebars =  require("handlebars");

exports.sendTwilioCode = async (phoneNumber) => {
 return await client.verify.v2.services(process.env.SERVICE_SID)
  .verifications
  .create({to: phoneNumber, channel: 'sms'})
};

exports.verifyTwilioCode = async (phoneNumber, code) => {
    return await client.verify.v2.services(process.env.SERVICE_SID)
    .verificationChecks
    .create({to: phoneNumber, code: code})
};

exports.sendCodeToEmail = async (email, code) => {
    const filePath = path.join(__dirname, '../utils/verifyEmailTemplate.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        verification_code: code
    };
    const htmlToSend = template(replacements);
      const message = {
        from: process.env.MAIL_AUTH_USER,
        to: email,
        subject: 'P2P - Verification code',
        html: htmlToSend
      };
    await transport.sendMail(message);
};