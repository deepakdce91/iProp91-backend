const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const FAQ = require("../../models/knowledgeCenter/faqs");
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Get a single FAQ by ID [/api/faqs/fetchitem/:id]
router.get(
  "/fetchFAQ/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide FAQ ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await FAQ.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });
      res.json(item);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Get all FAQs [/api/faqs/fetchallitems]
router.get(
  "/fetchAllFAQs",
  fetchUser,
  [query("userId", "Invalid or missing userId").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await FAQ.find();
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new FAQ [/api/faqs/additem]
router.post(
  "/addFAQ",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("title", "Title is required").exists(),
    body("type", "Type is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { type, title, content, file, enable } = req.body;

      const addItem = { title, type };
      if (content) addItem.content = content;
      if (file) addItem.file = file;
      if (enable) addItem.enable = enable || "true";

      const newItem = new FAQ(addItem);

      const savedItem = await newItem.save();
      res.json(savedItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing FAQ by ID [/api/faqs/updateitem/:id]
router.put(
  "/updateFAQ/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide FAQ ID.").exists(),
  ],
  async (req, res) => {
    const {type, title, content, file, enable } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedItem = {};
      if (title) updatedItem.title = title;
      if (content) updatedItem.content = content;
      if (file) updatedItem.file = file;
      if (enable) updatedItem.enable = enable;
      if (type) updatedItem.type = type;

      const item = await FAQ.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });

      const updatedFAQItem = await FAQ.findByIdAndUpdate(
        req.params.id,
        { $set: updatedItem },
        { new: true }
      );
      res.json(updatedFAQItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete an FAQ by ID [/api/faqs/deleteitem/:id]
router.delete(
  "/deleteFAQ/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide FAQ ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await FAQ.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });

      const deletedItem = await FAQ.findByIdAndDelete(req.params.id);
      res.json({ Success: "Item has been deleted.", deletedItem });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 5: Fetch all enabled knowledge-center FAQs for customers [/api/faqs/fetchAllActiveKnowledgeCenterFAQs]
router.get(
  "/fetchAllActiveKnowledgeCenterFAQs",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await FAQ.find({ 
        enable: "true",
        type : "knowledge-center" 
      });
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 6: Fetch all enabled nri FAQs for customers [/api/faqs/fetchAllActiveNriFAQs]
router.get(
  "/fetchAllActiveNriFAQs",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await FAQ.find({ 
        enable: "true",
        type : "nri" 
      });
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 7: Fetch all enabled site FAQs for customers [/api/faqs/fetchAllActiveSiteFAQs]
router.get(
  "/fetchAllActiveSiteFAQs",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await FAQ.find({ 
        enable: "true",
        type : "site" 
      });
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
