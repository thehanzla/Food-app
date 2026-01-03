import nodemailer from 'nodemailer';

export const sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your preferred service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use an "App Password" here, not your real password
      },
    });

    await transporter.sendMail({
      from: `"FoodieAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email not sent", error);
    throw new Error('Email sending failed');
  }
};