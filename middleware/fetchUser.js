const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_KEY;

const fetchUser = (req, resp, next) => {
  const token = req.header("auth-token");

  try {
    if (!token) {
      resp
        .status(401)
        .json({ error: "Please authenticate using a valid token." });
    } else {
      const data = jwt.verify(token, secretKey);
      if (req.query.userId === data.userId) {
        next();
      } else {
        resp
          .status(401)
          .json({
            error: "Please authenticate using a right token and userId.",
          });
      }
    }
  } catch (error) {
    resp
      .status(401)
      .json({ error: "Please authenticate using a valid token." });
  }
};

module.exports = fetchUser;
