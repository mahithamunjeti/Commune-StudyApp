const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  // console.log("Authorization Header:", authHeader);
  // console.log("Extracted Token:", token);

  if (!token) {
    return res.status(401).send({ message: "No token provided, please login" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).send({ message: "Failed to authenticate token" });
    }

    req.user = {
      _id: decoded._id,  // Make sure this matches your token payload
    };

    // console.log("Decoded token user:", req.user);
    next();
  });
};

module.exports = verifyToken;
