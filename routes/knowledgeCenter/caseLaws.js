const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const CaseLaw = require("../../models/knowledgeCenter/caseLaws");
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Get a single case law by ID [/api/caselaws/fetchitem/:id]
router.get(
  "/fetchCaseLaw/:id",
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
      const item = await CaseLaw.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });
      res.json(item);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Get all case laws [/api/caselaws/fetchallitems]
router.get(
  "/fetchAllCaseLaws",
  fetchUser,
  [query("userId", "Invalid or missing userId").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await CaseLaw.find();
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new case law [/api/caselaws/additem]
router.post(
  "/addCaseLaw",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("title", "Title is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, file, enable } = req.body;

      const addItem = { title };
      if (content) addItem.content = content;
      if (file) addItem.file = file;
      if (enable) addItem.enable =  enable || "true";

      const newItem = new CaseLaw(addItem);

      const savedItem = await newItem.save();
      res.json(savedItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing case law by ID [/api/caselaws/updateitem/:id]
router.put(
  "/updateCaseLaw/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Case Law ID.").exists(),
  ],
  async (req, res) => {
    const { title, content, file, enable } = req.body;

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

      const item = await CaseLaw.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });

      const updatedCaseLawItem = await CaseLaw.findByIdAndUpdate(
        req.params.id,
        { $set: updatedItem },
        { new: true }
      );
      res.json(updatedCaseLawItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete a case law by ID [/api/caselaws/deleteitem/:id]
router.delete(
  "/deleteCaseLaw/:id",
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
      const item = await CaseLaw.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });

      const deletedItem = await CaseLaw.findByIdAndDelete(req.params.id);
      res.json({ Success: "Item has been deleted.", deletedItem });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 5 : Fetch all enabled case laws for customers 
router.get(
    "/fetchAllActiveCaseLaws",
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const items = await CaseLaw.find({enable : "true"});
        res.json(items);
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
      }
    }
  );
  


module.exports = router;
