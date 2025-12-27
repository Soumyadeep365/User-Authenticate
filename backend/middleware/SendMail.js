const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});


exports.sendMail = async (email, text, html) => {
    try {
        const mailInfo = await transporter.sendMail({
            from: `"Your App" <${process.env.EMAIL}>`,
            to: email,
            subject: 'Your One-Time Password (OTP)',
            text,
            html
        });
        console.log('Email sent successfully:', mailInfo.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};
