const fetchUser = require("../../middleware/fetchUser");
const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult, param, query } = require("express-validator");
const User = require("../../models/auth/Users"); 
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config(); 

const secretKey = process.env.JWT_KEY; 

// SECRET ROUTE fetch user for admin only
// gives back password as WELL
router.get("/fetchuserforadmin/:id", fetchUser, [query('userId', 'Invalid or missing userId').exists()], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }else{
      
      res.json(user);
    }
    

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
});

// ROUTE 0: Get a single user by ID [/api/users/fetchuser/:id]
// do not gives password field
router.get("/fetchuser/:id", fetchUser,  [query('userId', 'Invalid or missing userId').exists()], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(200).json({ success : false, error: "User not found." });
    }else{
      res.json(user);
    }
   
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
});

// ROUTE 2: Get all users [/api/users/fetchallusers]
router.get("/fetchallusers", fetchUser, [query('userId', 'Invalid or missing userId').exists()], async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
});


// ROUTE 2.0: Get all users (only _id, name, phone, profilePic ) [/api/users/fetchallusers]
router.get("/fetchallusersForGroupFormation", fetchUser, [query('userId', 'Invalid or missing userId').exists()], async (req, res) => {
  try {
    const users = await User.find().select("_id name phone profilePicture");
    // Add an extra field with a default value to each user
    const modifiedUsers = users.map(user => ({
      ...user._doc,          // Spread the original user data
      admin: "false" // Add the new field with a default value
    }));

    res.json(modifiedUsers);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
});

// ROUTE 3: Add a new user [/api/users/adduser]
router.post(
  "/adduser",
  fetchUser,
  [
    body("name", "Name is required").exists(),
    query('userId', 'Invalid or missing userId').exists(),
    body("phone", "Phone number is required").isMobilePhone(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        phone,
        email,
        profilePicture,
        password,
        lastLogin,
        suspended,
        fraud,
      } = req.body;

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      const newUserObj = {};
      if (name) newUserObj.name = name;
      if (phone) newUserObj.phone = phone;
      if (email) newUserObj.email = email;
      if (profilePicture) newUserObj.profilePicture = profilePicture;
      if (password) newUserObj.password = secPass;
      if (lastLogin) newUserObj.lastLogin = lastLogin;
      if (suspended) newUserObj.suspended = suspended;
      if (fraud) newUserObj.fraud = fraud;

      const user = new User(newUserObj);

      const savedUser = await user.save();
      res.json(savedUser);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 4: Update an existing user by ID [/api/users/updateuser/:id]
router.put("/updateuser/:id", fetchUser, [query('userId', 'Invalid or missing userId').exists()], async (req, res) => {
  const {
    name,
    phone,
    email,
    profilePicture,
    password,
    lastLogin,
    suspended,
    fraud,
  } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt);

    const updatedUser = {};
    if (name) updatedUser.name = name;
    if (phone) updatedUser.phone = phone;
    if (email) updatedUser.email = email;
    if (profilePicture) updatedUser.profilePicture = profilePicture;
    if (password) updatedUser.password = secPass;
    if (lastLogin) updatedUser.lastLogin = lastLogin;
    if (suspended) updatedUser.suspended = suspended;
    if (fraud) updatedUser.fraud = fraud;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userUpdate = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updatedUser },
      { new: true }
    );
    res.json(userUpdate);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
});

// ROUTE 5: Delete an existing user by ID [/api/users/deleteuser/:id]
router.delete("/deleteuser/:id", fetchUser,  [query('userId', 'Invalid or missing userId').exists()],async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.json({ Success: "User has been deleted.", deletedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
});

// ---------- apis for login/signup ------------

// ROUTE 6: Get a single user by phone [/api/users/fetchuser/:id]
router.get("/fetchuserbyphone/:phone",  async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone }).select(
      "-password"
    );
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found." });
    } else {
      return res.status(200).json({ success: true, message: "User exists." });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error.");
  }
});

//Route 7: login  user [/api/users/login]
router.get(
  "/login/:phone",
  [param("phone", "Phone number is required").isMobilePhone()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findOne({ phone: req.params.phone }).select(
        "-password"
      );
      if (!user) {
        return res
          .status(200)
          .json({ success: false, message: "User not found." });
      } else {
        if (user.fraud === "true" || user.suspended === "true") {
          return res
            .status(200)
            .json({ success: false, message: "Account suspended." });
        } else {
          const userInfo = {
            userId: user._id,
          };
          const authToken = jwt.sign(userInfo, secretKey);
          return res.status(200).json({ success: true, token: authToken });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

//Route 8: signup  user [/api/users/signup]
router.post(
  "/signup",
  [body("phone", "Phone number is required").isMobilePhone()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, phone, email, password } = req.body;

      const signupObj = {
        phone,
      };

      if (name) signupObj.name = name;
      if (email) signupObj.email = email;

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      if (password) signupObj.password = secPass;

      const user = new User(signupObj);

      const savedUser = await user.save();

      const userInfo = {
        userId: savedUser._id,
      };

      // getting token using id
      const authToken = jwt.sign(userInfo, secretKey);

      res.json({ success: true, token: authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
); 

////Route 9: set user password [/api/users/createpassword]
router.put(
  "/createpassword",
  fetchUser,
  [
    query("userId", "User id is required").exists(),
    body("password", "Password is required.").exists(),
  ],
  async (req, res) => {
    const { userId } = req.query;
    const { password } = req.body;

    try {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      const updatedUser = {
        password: secPass,
      };

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const passwordSet = await User.findByIdAndUpdate(
        userId,
        { $set: updatedUser },
        { new: true }
      );
      if (!passwordSet) {
        res.status(500).send("Internal server error.");
      } else {
        res.status(200).send({ success: true, message: "Password Updated" });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

////Route 10: change user password [/api/users/changepassword]
router.put(
  "/changepassword",
  fetchUser,
  [
    query("userId", "User id is required").exists(),
    body("oldPassword", "Old password is required.").exists(),
    body("newPassword", "New password is required.").exists(),
  ],
  async (req, res) => {
    const { userId } = req.query;
    const { newPassword } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      } else {
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(newPassword, salt);
        const updatedUser = {
          password: secPass,
        };

        const passwordUpdate = await User.findByIdAndUpdate(
          userId,
          { $set: updatedUser },
          { new: true }
        );
        if (!passwordUpdate) {
          res.status(500).send("Internal server error.");
        } else {
          res.status(200).send({ success: true, message: "Password Updated" });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 11 : to get userDetails
router.get(
  "/getuserdetails",
  fetchUser,
  [query("userId", "User id is required").exists()],
  async (req, res) => {
    const { userId } = req.query;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      } else {
        const returnData = {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          password: user.password,
          profilePicture: user.profilePicture,
        };

        return res.status(200).json({ success: true, data: returnData });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 12 : to update userDetails
router.put(
  "/updateuserdetails",
  fetchUser,
  [query("userId", "User id is required").exists()],
  async (req, res) => {
    const { userId } = req.query;
    const { name, phone, email, profilePicture } = req.body;

    try {
      const updatedUser = {};
      if (name) updatedUser.name = name;
      if (phone) updatedUser.phone = phone;
      if (email) updatedUser.email = email;
      if (profilePicture) updatedUser.profilePicture = profilePicture;

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      } else {
        const userAfterUpdate = await User.findByIdAndUpdate(
          userId,
          { $set: updatedUser },
          { new: true }
        );
        const returnData = {
          _id: userAfterUpdate._id,
          name: userAfterUpdate.name,
          phone: userAfterUpdate.phone,
          email: userAfterUpdate.email,
          profilePicture: userAfterUpdate.profilePicture,
        };
        return res.status(200).json({ success: true, data: returnData });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 13: login user with password [/api/users/loginwithpassword]
router.get(
  "/loginwithpassword",
  [
    query("phone", "Phone number is required").isMobilePhone(),
    query("password", "Password is required").exists(),
  ],
  async (req, res) => {
    // Retrieve phone and password from query params instead of req.body
    const { phone, password } = req.query;

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if user exists by phone number
      const user = await User.findOne({ phone });

      if (!user) {
        return res
          .status(200)
          .json({ success: false, message: "User not found." });
      } else {
        if (user.password === "") {
          return res
            .status(200)
            .json({ success: false, message: "Password is not set." });
        } else {
          // Compare the provided password with the stored hashed password
          const passCompare = await bcrypt.compare(password, user.password);
          if (!passCompare) {
            return res
              .status(400)
              .json({ success: false, error: "Password is incorrect." });
          } else {
            if (user.fraud === "true" || user.suspended === "true") {
              return res
                .status(200)
                .json({ success: false, message: "Account suspended." });
            } else {
              const userInfo = {
                userId: user._id,
              };
              const authToken = jwt.sign(userInfo, secretKey); // Generate JWT
              return res.status(200).json({ success: true, token: authToken });
            }
          }
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
