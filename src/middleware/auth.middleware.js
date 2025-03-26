const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  verifyToken,
};
