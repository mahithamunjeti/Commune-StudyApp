const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");

// Email transporter setup (Gmail example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     // your Gmail address
    pass: process.env.EMAIL_PASS      // your Gmail app password (not your login password)
  }
});

async function sendVerificationEmail(email, usersCollection, emailVerificationCollection) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // expires in 15 min

  console.log("emailVerificationCollection exists:", !!emailVerificationCollection);


  // Save token in DB
  await emailVerificationCollection.insertOne({
    email,
    token,
    verified: false,
    expiresAt
  });

  const verificationLink = `http://localhost:4000/user-api/verify-email/${token}`;

  // Send the verification email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email address",
    html: `
      <h2>Email Verification</h2>
      <p>Please click the button below to verify your email:</p>
      <a href="${verificationLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Verify Email</a>
      <p>This link will expire in 15 minutes.</p>
    `
  });

  return token;
}

module.exports = {
  sendVerificationEmail
};