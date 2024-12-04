const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const Comparison = require("../../models/frontendPreview/Comparisons"); 
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Get a single comparison item by ID [/api/comparisons/fetchComparison/:id]
router.get(
  "/fetchComparison/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Comparison ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await Comparison.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Comparison not found." });
      res.json(item);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Get all comparison items [/api/comparisons/fetchAllComparisons]
router.get(
  "/fetchAllComparisons",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
  ],
  async (req, res) => {
    try {
      const items = await Comparison.find();
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new comparison item [/api/comparisons/addComparison]
router.post(
  "/addComparison",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("title", "Title is required").exists(),
    body("topText", "Top Text is required").exists(),
    body("bottomText", "Bottom Text is required").exists(),
    body("centerImage1", "Center Image 1 is required").exists(),
    body("centerImage2", "Center Image 2 is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, topText, bottomText, centerImage1, centerImage2, enable } = req.body;
      const newComparison = new Comparison({
        title,
        topText,
        bottomText,
        centerImage1,
        centerImage2,
        enable: enable || "true",
      });

      const savedComparison = await newComparison.save();
      res.json(savedComparison);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing comparison item by ID [/api/comparisons/updateComparison/:id]
router.put(
  "/updateComparison/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Comparison ID.").exists(),
  ],
  async (req, res) => {
    const { title, topText, bottomText, centerImage1, centerImage2, enable } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedComparison = {};
      if (title) updatedComparison.title = title;
      if (topText) updatedComparison.topText = topText;
      if (bottomText) updatedComparison.bottomText = bottomText;
      if (centerImage1) updatedComparison.centerImage1 = centerImage1;
      if (centerImage2) updatedComparison.centerImage2 = centerImage2;
      if (enable) updatedComparison.enable = enable;

      const comparison = await Comparison.findById(req.params.id);
      if (!comparison) return res.status(404).json({ error: "Comparison not found." });

      const updatedComparisonItem = await Comparison.findByIdAndUpdate(
        req.params.id,
        { $set: updatedComparison },
        { new: true }
      );
      res.json(updatedComparisonItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete a comparison item by ID [/api/comparisons/deleteComparison/:id]
router.delete(
  "/deleteComparison/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Comparison ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comparison = await Comparison.findById(req.params.id);
      if (!comparison) return res.status(404).json({ error: "Comparison not found." });

      const deletedComparison = await Comparison.findByIdAndDelete(req.params.id);
      res.json({ success: "Comparison has been deleted.", deletedComparison });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 5: Fetch all enabled comparison items [/api/comparisons/fetchAllEnabledComparisons]
router.get(
  "/fetchAllEnabledComparisons",
  async (req, res) => {
    try {
      const items = await Comparison.find({ enable: "true" });
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
