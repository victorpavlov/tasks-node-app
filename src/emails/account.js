// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'vitekpavlov@gmail.com',
    subject: 'Welcome to Notes app',
    text: `Hi, ${name}, and easy to do anywhere, even with Node.js`,
  }

  sgMail
  .send(msg)
};

const sendBayEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'vitekpavlov@gmail.com',
    subject: 'Sorry you leave Notes app',
    text: `Good bay, ${name}, and easy to do anywhere, even with Node.js`,
  }

  sgMail
  .send(msg)
};

module.exports = {
  sendWelcomeEmail,
  sendBayEmail,
};
