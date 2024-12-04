const express = require("express");
const fetchUser = require("../../middleware/fetchUser");
const { body, validationResult, param, query } = require("express-validator");
const Communities = require("../../models/configurations/Communities");
const router = express.Router();

// ---------------------------------------------------------------
// ROUTES FOR users
// GET communities userId in the customers array
router.get(
  "/getAllCommunitiesForCustomers",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(), 
  ],
  async (req, res) => {
    const { userId } = req.query;  
    try {
      const community = await Communities.find({
        customers: { $elemMatch: { _id: userId } } 
      });

      if (!community) {
        return res
          .status(200)
          .json({ success: false, message: "Community not found or user not part of this community." });
      }else{
        res.json({ success: true, data: community });
      }

     
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ---------------------------------------------------------------
// ROUTES FOR ADMINS

//route 0 : get all communities
router.get(
  "/getAllCommunities",
  fetchUser,
  [query("userId", "Invalid or missing userId").exists()],
  async (req, res) => {
    try {
      const communities = await Communities.find();
      if (!communities) {
        return res
          .status(404)
          .json({ success: false, message: "No communitites found." });
      }
      res.json({ success: true, data: communities });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 1: GET a specific community by ID
router.get(
  "/getCommunity/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Community ID is required").exists(),
  ],
  async (req, res) => {
    const { id } = req.params;

    try {
      const community = await Communities.findById(id);
      if (!community) {
        return res
          .status(404)
          .json({ success: false, message: "Community not found." });
      }
      res.json({ success: true, data: community });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


// ROUTE 2: POST to create a new community
router.post(
  "/addCommunity",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("name", "Community name is required").exists(),
    body("state", "State is required").exists(),
    body("city", "City is required").exists(),
    body("builder", "Builder is required").exists(),
    body("projects", "projects is required").exists(),
  ],
  async (req, res) => {
    const { name, state, city, builder, thumbnail, projects, customers } =
      req.body;

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const myObj = { name, state, city, builder, projects };
      if(thumbnail) {myObj.thumbnail = thumbnail} 
      if (req.body.customers) {
        myObj["customers"] = customers;
      }
      const newCommunity = new Communities(myObj);
      const data = await newCommunity.save();
      res.json({
        success: true,
        message: "Community created successfully.",
        data,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


// ROUTE 3: PUT to update a community
router.put(
  "/updateCommunity/:id",
  fetchUser,
  [
    param("id", "Community ID is required").exists(),
    query("userId", "Invalid or missing userId").exists(),
    body("name", "Community name is required").optional(),
    body("state", "State is required").optional(),
    body("city", "City is required").optional(),
    body("builder", "Builder is required").optional(),
    body("thumbnail", "Thumbnail is required").optional(),
  ],
  async (req, res) => {
    const { id } = req.params;
    const { name, state, city, builder, thumbnail, projects, customers } =
      req.body;
    const newUserObj = {};
    if (name) newUserObj.name = name;
    if (state) newUserObj.state = state;
    if (city) newUserObj.city = city;
    if (builder) newUserObj.builder = builder;
    if (thumbnail) newUserObj.thumbnail = thumbnail;
    if (projects) newUserObj.projects = projects;
    if (customers) newUserObj.customers = customers;

    try {
      const community = await Communities.findByIdAndUpdate(
        id,
        { $set: newUserObj },
        { new: true }
      );
      if (!community) {
        return res
          .status(404)
          .json({ success: false, message: "Community not found." });
      }
      res.json({ success: true, message: "Community not found." });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 4: DELETE a community
router.delete(
  "/deleteCommunity/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Community ID is required").exists(),
  ],
  async (req, res) => {
    const { id } = req.params;

    try {
      const deletedCommunity = await Communities.findByIdAndDelete(id);
      if (!deletedCommunity) {
        return res
          .status(404)
          .json({ success: false, message: "Community not found." });
      }
      res.json({ success: true, message: "Community deleted." });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 5: POST to add a customer to a community
router.post(
  "/addCustomer/:id",
  fetchUser,
  [
    param("id", "Community ID is required").exists(),
    query("userId", "Invalid or missing userId").exists(),
    body("_id", "Customer id is required").exists(),
    body("name", "Customer user name is required").exists(),
    body("phone", "Customer phone number is required").exists(),
    body("profilePicture", "Customer profilePicture is required").exists(),
  ],
  async (req, res) => {
    const { id } = req.params;
    const { _id, name, phone, profilePicture } = req.body;

    try {
      const community = await Communities.findById(id);
      if (!community) {
        return res
          .status(404)
          .json({ success: false, message: "Community not found." });
      }

      // Check if customer with the same _id already exists
      const existingCustomer = community.customers.find(
        (customer) => customer._id.toString() === _id
      );

      if (existingCustomer) {
        return res
          .status(200)
          .json({ success: false, message: "Customer already in the community." });
      }

      // Add new customer if not already present
      community.customers.push({
        _id,
        name,
        phone,
        profilePicture,
        admin: "false",
      });
      await community.save();

      res.json({ success: true, message: "Customer added to community." });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


// ROUTE 6: DELETE a customer from a community
router.delete(
  "/removeCustomer/:id/:customerId",
  fetchUser,
  [
    param("id", "Community ID is required").exists(),
    param("customerId", "Customer ID is required").exists(),
    query("userId", "Invalid or missing userId").exists(),
  ],
  async (req, res) => {
    const { id, customerId } = req.params;

    try {
      const community = await Communities.findById(id);
      if (!community) {
        return res
          .status(404)
          .json({ success: false, message: "Community not found." });
      }
      community.customers = community.customers.filter(
        (customer) => customer._id !== customerId
      );
      await community.save();
      res.json({ success: true, message: "Customer removed from community." });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 7: PUT to make a customer an admin or remove admin status
router.put(
  "/toggleAdmin/:id/:customerId",
  fetchUser,
  [
    param("id", "Community ID is required").exists(),
    param("customerId", "Customer ID is required").exists(),
    query("userId", "Invalid or missing userId").exists(),
  ],

  async (req, res) => {
    const { id, customerId } = req.params;
    const {userId} = req.query;

    try {
      if(userId.includes("IPA")){
        // Find the community by ID
      const community = await Communities.findById(id);
      if (!community) {
        return res
          .status(404)
          .json({ success: false, message: "Community not found." });
      } else {
        // Find the customer in the community's customers list
        const customer = community.customers.find(
          (cust) => cust._id === customerId
        );
        if (!customer) {
          return res
            .status(404)
            .json({ success: false, message: "Customer not found." });
        } else {
          // Toggle the 'admin' status
          customer.admin = customer.admin === "false" ? "true" : "false";

          // Save the updated community
          await community.save();

          res.json({
            success: true,
            message: `Customer ${
              customer.admin === "true"
                ? "Promoted to admin"
                : "demoted from admin"
            }.`,
          });
        }
      }
      }else{
        return res
            .status(401)
            .json({ success: false, message: "You are not an admin." });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
