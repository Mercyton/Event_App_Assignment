
import nodemailer from "nodemailer";

// Create a transporter using Ethereal credentials
const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST,
  port: parseInt(process.env.ETHEREAL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

/**
 * Sends a mock welcome email to a new user.
 * @param {string} userEmail - The recipient's email address.
 */
export const sendWelcomeEmail = async (userEmail) => {
  const mailOptions = {
    from: '"Event App" <noreply@eventapp.com>',
    to: userEmail,
    subject: "Welcome to the Event Management App!",
    text: "Welcome! Your account has been created successfully.",
    html: "<b>Welcome!</b><p>Your account has been created successfully.</p>",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    // Log the URL to preview the email in Ethereal
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // In a real app, you might want to handle this more gracefully
  }
};
