const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const Advise = require("../../models/frontendPreview/Advise"); // Updated model import
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Get a single advise by ID [/api/advise/fetchAdvise/:id]
router.get(
  "/fetchAdvise/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Advise Id.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await Advise.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Advise not found." });
      res.json(item);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Get all advises [/api/advise/fetchAllAdvise]
router.get(
  "/fetchAllAdvise",
  fetchUser,
  [query("userId", "Invalid or missing userId").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Advise.find();
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new advise [/api/advise/addAdvise]
router.post(
  "/addAdvise",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("title", "Title is required").exists(),
    body("file.name", "File name is required").exists(),
    body("file.url", "File URL is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, file, enable } = req.body;

      const newAdvise = new Advise({
        title,
        file,
        enable: enable || "true",
      });

      const savedItem = await newAdvise.save();
      res.json(savedItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing advise by ID [/api/advise/updateAdvise/:id]
router.put(
  "/updateAdvise/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Advise Id.").exists(),
  ],
  async (req, res) => {
    const { title, file, enable } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedAdvise = {};
      if (title) updatedAdvise.title = title;
      if (file) updatedAdvise.file = file;
      if (enable) updatedAdvise.enable = enable;

      const item = await Advise.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Advise not found." });

      const updatedAdviseItem = await Advise.findByIdAndUpdate(
        req.params.id,
        { $set: updatedAdvise },
        { new: true }
      );
      res.json(updatedAdviseItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete an advise by ID [/api/advise/deleteAdvise/:id]
router.delete(
  "/deleteAdvise/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Advise Id.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await Advise.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Advise not found." });

      const deletedItem = await Advise.findByIdAndDelete(req.params.id);
      res.json({ Success: "Advise has been deleted.", deletedItem });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 5: Fetch all active advises (enabled) [/api/advise/fetchAllActiveAdvise]
router.get(
  "/fetchAllActiveAdvise",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Advise.find({ enable: "yes" });
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
