const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const OwnersFrom = require("../../models/configurations/OwnersFrom");
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Get a single case law by ID [/api/OwnersFroms/fetchitem/:id]
router.get(
  "/fetchOwnerFrom/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Case Law ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await OwnersFrom.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });
      res.json(item);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Get all case laws [/api/OwnersFroms/fetchallitems]
router.get(
  "/fetchAllOwnersFrom",
  fetchUser,
  [query("userId", "Invalid or missing userId").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await OwnersFrom.find();
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new case law [/api/OwnersFroms/additem]
router.post(
  "/addOwnersFrom",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("name", "Name is required").exists(),
    body("url", "Url is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, url, enable } = req.body;

      const addItem = { name, url };
      if (enable) addItem.enable =  enable || "true";

      const newItem = new OwnersFrom(addItem);

      const savedItem = await newItem.save();
      res.json(savedItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing case law by ID [/api/OwnersFroms/updateitem/:id]
router.put(
  "/updateOwnersFrom/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Case Law ID.").exists(),
  ],
  async (req, res) => {
    const { name, url, enable } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedItem = {};
      if (name) updatedItem.name = name;
      if (url) updatedItem.url = url;
      if (enable) updatedItem.enable = enable;

      const item = await OwnersFrom.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });

      const updatedOwnersFromItem = await OwnersFrom.findByIdAndUpdate(
        req.params.id,
        { $set: updatedItem },
        { new: true }
      );
      res.json(updatedOwnersFromItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete a case law by ID [/api/OwnersFroms/deleteitem/:id]
router.delete(
  "/deleteOwnersFrom/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Case Law ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await OwnersFrom.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });

      const deletedItem = await OwnersFrom.findByIdAndDelete(req.params.id);
      res.json({ Success: "Item has been deleted.", deletedItem });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 5 : Fetch all enabled case laws for customers 
router.get(
    "/fetchAllActiveOwnersFrom",
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const items = await OwnersFrom.find({enable : "true"});
        res.json(items);
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
      }
    }
  );
  


module.exports = router;
