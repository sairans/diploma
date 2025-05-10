const nodeMailer = require('nodemailer');
require('dotenv').config();

const transporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: `Booking App <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });

  console.log('Message sent: %s', info.messageId);
}

module.exports = { sendEmail };
