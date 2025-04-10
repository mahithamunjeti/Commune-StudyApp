const express = require('express');
const userApp = express.Router();
const { createUserOrAuthor,userOrAuthorLogin } = require('./Util'); 
const { sendVerificationEmail } = require('./emailVerification');
const jwt = require('jsonwebtoken');
 // Destructure from module.exports

userApp.post('/user', createUserOrAuthor);

userApp.post('/login',userOrAuthorLogin);
userApp.post('/verify-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send({ message: 'Email is required' });

  try {
    const usersCollection = req.app.get("usersCollection");
    const emailVerificationCollection = req.app.get("emailVerificationCollection");

    await sendVerificationEmail(email, usersCollection, emailVerificationCollection); // ✅ pass both
    res.send({ message: 'Verification email sent' });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ message: 'Failed to send verification email' });
  }
});

userApp.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;
  const usersCollection = req.app.get("usersCollection");
  const emailVerificationCollection = req.app.get("emailVerificationCollection");

  try {
    const tokenDoc = await emailVerificationCollection.findOne({ token });

    if (!tokenDoc) {
      return res.status(400).send("Invalid or expired verification link.");
    }

    if (tokenDoc.expiresAt < new Date()) {
      return res.status(400).send("Verification link has expired.");
    }

    // Update user's isVerified status
    await usersCollection.updateOne(
      { email: tokenDoc.email },
      { $set: { isVerified: true } }
    );

    // Optionally delete the token after use
    await emailVerificationCollection.deleteOne({ token });

    res.send(`
      <html>
        <body style="font-family:sans-serif;text-align:center;padding-top:50px;">
          <h2>Email successfully verified ✅</h2>
          <p>You can now return to the app and log in.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send("Something went wrong while verifying your email.");
  }
});

module.exports = userApp;