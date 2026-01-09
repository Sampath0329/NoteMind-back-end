import nodemailer from 'nodemailer';

const sendEmail = async (options: { to: string; subject: string; text: string; }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, // Your gmail address
      pass: process.env.EMAIL_PASSWORD, // Your 16-digit App Password
    },
  });

  const mailOptions = {
    from: `"NoteMind AI" <${process.env.EMAIL_USERNAME}>`, // Best practice to use your authenticated email
    to: options.to,
    subject: options.subject,
    html: options.text, // This matches your controller which sends HTML strings
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw new Error("Email could not be sent"); 
  }
};

export default sendEmail;