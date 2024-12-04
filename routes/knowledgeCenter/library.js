const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const Library = require("../../models/knowledgeCenter/library");
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Get a single library item by ID [/api/library/fetchitem/:id]
router.get(
  "/fetchBlog/:id",
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
      const item = await Library.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });
      res.json(item);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Get all library items [/api/library/fetchallitems]
router.get(
  "/fetchAllBlogs",
  fetchUser,
  [query("userId", "Invalid or missing userId").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Library.find();
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new library item [/api/library/additem]
router.post(
  "/addBlog",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("title", "Title is required").exists(),
    body("priority", "Priority is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { thumbnail, title, content, enable, youtubeVideos, additionalMediaLinks, priority } = req.body;

      const addObj = {
        priority,
        thumbnail,
        title,
        content,
        enable: enable || "true",
      }

      if(youtubeVideos)addObj.youtubeVideos = youtubeVideos;
      if(additionalMediaLinks)addObj.additionalMediaLinks = additionalMediaLinks;


      const newItem = new Library(addObj);

      const savedItem = await newItem.save();
      res.json(savedItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing library item by ID [/api/library/updateitem/:id]
router.put(
  "/updateBlog/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Blog Id.").exists(),
  ],
  async (req, res) => {
    const { thumbnail, title, content, enable,youtubeVideos, additionalMediaLinks, priority } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedItem = {};
      if (priority) updatedItem.priority = priority;
      if (thumbnail) updatedItem.thumbnail = thumbnail;
      if (title) updatedItem.title = title;
      if (content) updatedItem.content = content;
      if (enable) updatedItem.enable = enable;

      if(youtubeVideos)updatedItem.youtubeVideos = youtubeVideos;
      if(additionalMediaLinks)updatedItem.additionalMediaLinks = additionalMediaLinks;

      const item = await Library.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });

      const updatedLibraryItem = await Library.findByIdAndUpdate(
        req.params.id,
        { $set: updatedItem },
        { new: true }
      );
      res.json(updatedLibraryItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete a library item by ID [/api/library/deleteitem/:id]
router.delete(
  "/deleteBlog/:id",
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
      const item = await Library.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found." });

      const deletedItem = await Library.findByIdAndDelete(req.params.id);
      res.json({ Success: "Item has been deleted.", deletedItem });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


// Route 5 : Fetch all enabled case laws for customers 
router.get(
    "/fetchAllActiveBlogs",
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const items = await Library.find({enable : "true"});
        res.json(items);
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
      }
    }
  );


// Route 6 : Fetch all HIGH PRIORITY enabled case laws for customers 
router.get(
  "/fetchAllHighPriorityActiveBlogs",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Library.find({
        enable : "true",
        priority: { $gte: 1, $lte: 2 }
      });
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 7 : Fetch all MEDIUM PRIORITY enabled case laws for customers 
router.get(
  "/fetchAllMediumPriorityActiveBlogs",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Library.find({
        enable : "true",
        priority: { $gte: 3, $lte: 4 }
      });
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 8 : Fetch all LOW PRIORITY enabled case laws for customers 
router.get(
  "/fetchAllLowPriorityActiveBlogs",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Library.find({
        enable : "true",
        priority: { $gte: 5, $lte: 6 }
      });
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);
  

module.exports = router;
