const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const MobileTile = require("../../models/frontendPreview/MobileTiles"); 
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Get a single mobile tile item by ID [/api/mobile/fetchTile/:id]
router.get(
  "/fetchMobileTile/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Blog Id.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try { 
      const item = await MobileTile.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Tile not found." });
      res.json(item);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Get all mobile tile items [/api/mobileTiles/fetchAllTiles]
router.get(
  "/fetchAllMobileTiles",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Blog Id.").exists(),
  ],
  async (req, res) => {
    try {
      const items = await MobileTile.find();
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new mobile tile item [/api/mobileTiles/addTile]
router.post(
  "/addMobileTile",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("image", "Image is required").exists(),
    body("title", "Title is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, image, enable } = req.body;

      const newTile = new MobileTile({
        title,
        image,
        enable: enable || "true",
      });

      const savedTile = await newTile.save();
      res.json(savedTile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing mobile tile item by ID [/api/mobileTiles/updateTile/:id]
router.put(
  "/updateMobileTile/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Tile ID.").exists(),
  ],
  async (req, res) => {
    const {title, image, enable } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedTile = {};
      if (title) updatedTile.title = title;
      if (image) updatedTile.image = image;
      if (enable) updatedTile.enable = enable;

      const tile = await MobileTile.findById(req.params.id);
      if (!tile) return res.status(404).json({ error: "Tile not found." });

      const updatedMobileTile = await MobileTile.findByIdAndUpdate(
        req.params.id,
        { $set: updatedTile },
        { new: true }
      );
      res.json(updatedMobileTile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete a mobile tile item by ID [/api/mobileTiles/deleteTile/:id]
router.delete(
  "/deleteMobileTile/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Tile ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const tile = await MobileTile.findById(req.params.id);
      if (!tile) return res.status(404).json({ error: "Tile not found." });

      const deletedTile = await MobileTile.findByIdAndDelete(req.params.id);
      res.json({ success: "Tile has been deleted.", deletedTile });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 5: Fetch all enabled mobile tiles [/api/mobileTiles/fetchAllEnabledTiles]
router.get(
  "/fetchAllEnabledMobileTiles",
  async (req, res) => {
    try {
      const items = await MobileTile.find({ enable: "true" });
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
