const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (!process.env.SMTP_HOST) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn("SMTP not configured. Skipping email send.");
    return;
  }

  await mailer.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
};
