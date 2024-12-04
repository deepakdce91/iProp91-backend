
const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult, param, query } = require("express-validator");
const Admin = require("../../models/auth/Admins");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_KEY;

//Route 7: login  user [/api/admin/login]
router.get(
  "/login",
  [
    query("email", "Email is required").isEmail(),
    query("password", "Password is required.").exists(),
  ],
  async (req, res) => {
    const { email, password } = req.query;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); 
      }else{
        const admin = await Admin.findOne({ email });
      if (!admin) {
        return res
          .status(200)
          .json({ success: false, message: "Account do not exists." });
      } else {
        const passCompare = await bcrypt.compare(password, admin.password);
        if (!passCompare) {
          return res
            .status(400)
            .json({ success: false, error: "Password is incorrect." });
        } else {
          const userInfo = {
            userId: admin._id,
          };
          const authToken = jwt.sign(userInfo, secretKey);
          return res.status(200).json({ success: true, token: authToken });
        }
      }
      }

      
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

//Route 8: signup  user [/api/admin/signup]
router.post(
  "/signup",
  [
    body("name", "name is required.").exists(),
    body("email", "Email number is required").isEmail(),
    body("password", "Password is required.").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        const { name, email, password } = req.body;

        // check if user already exists

        const admin = await Admin.findOne({ email });
        if (!admin) {
          const salt = await bcrypt.genSalt(10);
          const secPass = await bcrypt.hash(password, salt);

          const signupObj = {
            name,
            email,
            password: secPass,
          };

          const admin = new Admin(signupObj);

          const savedAdmin = await admin.save();

          const adminInfo = {
            userId: savedAdmin._id,
          };

          // getting token using id
          const authToken = jwt.sign(adminInfo, secretKey);

          res.json({ success: true, token: authToken });
        } else {
          return res
            .status(200)
            .json({ success: false, message: "Account already exists." });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
