const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { sendVerificationEmail } = require('./emailVerification'); // ✅ Added line

//req handler for user/author registration
const createUserOrAuthor = async (req, res) => {
  const usersCollectionObj = req.app.get("usersCollection");
  const emailVerificationCollection = req.app.get("emailVerificationCollection");

  const user = req.body;

  if (user.userType === "user") {
    // 🔍 Check for existing username
    let existingUserByUsername = await usersCollectionObj.findOne({ username: user.username });
    if (existingUserByUsername !== null) {
      return res.send({ message: "Username already taken" });
    }

    // 🔍 Check for existing email
    let existingUserByEmail = await usersCollectionObj.findOne({ email: user.email });
    if (existingUserByEmail !== null) {
      return res.send({ message: "Email already registered" });
    }
  }

  // ✅ Continue with registration if both username & email are unique
  const hashedPassword = await bcryptjs.hash(user.password, 7);
  user.password = hashedPassword;
  user.isVerified = false;

  if (user.userType === 'user') {
    await usersCollectionObj.insertOne(user);
    await sendVerificationEmail(user.email, usersCollectionObj, emailVerificationCollection);
    res.send({ message: "User created. Verification email sent." });
  }
};


const userOrAuthorLogin = async (req, res) => {
  const usersCollectionObj = req.app.get("usersCollection");
  const userCred = req.body;

  if (userCred.userType === 'user') {
    let dbuser = await usersCollectionObj.findOne({ username: userCred.username });

    if (!dbuser) {
      return res.status(401).send({ message: "Invalid username" });
    }

    const isPasswordValid = await bcryptjs.compare(userCred.password, dbuser.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    if (!dbuser.isVerified) {
      return res.status(403).send({ message: "Please verify your email before logging in" });
    }

    const signedToken = jwt.sign(
      { username: dbuser.username, _id: dbuser._id },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    delete dbuser.password;

    return res.send({
      message: "login success",
      token: signedToken,
      username: dbuser.username
    });
  }
};


module.exports = { createUserOrAuthor, userOrAuthorLogin };