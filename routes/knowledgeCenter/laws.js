const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const Law = require("../../models/knowledgeCenter/laws");  // Update path as per your structure
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Get a single law by ID [/api/laws/fetchitem/:id]
router.get(
  "/fetchLaw/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Law ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const law = await Law.findById(req.params.id);
      if (!law) return res.status(404).json({ error: "Law not found." });
      res.json(law);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    } 
  }
);

// Route 1: Get all laws [/api/laws/fetchallitems]
router.get(
  "/fetchAllLaws",
  fetchUser,
  [query("userId", "Invalid or missing userId").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const laws = await Law.find();
      res.json(laws);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new law [/api/laws/additem]
router.post(
  "/addLaw",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("type", "Type is required").exists(),
    body("title", "Title is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { type, state, title, content, file, enable } = req.body;

      const addItem = { title, type };
      if (state) addItem.state = state;
      if (content) addItem.content = content;
      if (file) addItem.file = file;
      if (enable) addItem.enable =  enable || "true";

      const newLaw = new Law(addItem);

      const savedLaw = await newLaw.save();
      res.json(savedLaw);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing law by ID [/api/laws/updateitem/:id]
router.put(
  "/updateLaw/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Law ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { type, state, title, content, file, enable } = req.body;
      const updatedFields = {};

      if (type) updatedFields.type = type;
      if (state) updatedFields.state = state;
      if (title) updatedFields.title = title;
      if (content) updatedFields.content = content;
      if (file) updatedFields.file = file;
      if (enable) updatedFields.enable = enable;

      const law = await Law.findById(req.params.id);
      if (!law) return res.status(404).json({ error: "Law not found." });

      const updatedLaw = await Law.findByIdAndUpdate(
        req.params.id,
        { $set: updatedFields },
        { new: true }
      );
      res.json(updatedLaw);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete a law by ID [/api/laws/deleteitem/:id]
router.delete(
  "/deleteLaw/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Law ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const law = await Law.findById(req.params.id);
      if (!law) return res.status(404).json({ error: "Law not found." });

      const deletedLaw = await Law.findByIdAndDelete(req.params.id);
      res.json({ success: "Law has been deleted.", deletedLaw });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 5: Fetch all enabled laws for customers [/api/laws/fetchAllActiveLaws]
// router.get(
//   "/fetchAllActiveLaws",
//   fetchUser,
//   [query("userId", "Invalid or missing userId").exists()],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const laws = await Law.find({ enable: "true" });
//       res.json(laws);
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send("Internal server error.");
//     }
//   }
// );


// Route 6: Fetch all active laws with type = 'central' [/api/laws/fetchAllActiveCentralLaws]
router.get(
  "/fetchAllActiveCentralLaws",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const centralLaws = await Law.find({ enable: "true", type: "central" });
      res.json(centralLaws);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 7: Fetch unique states from active laws with type = 'state' [/api/laws/fetchActiveStates]
router.get(
  "/fetchActiveStates",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const states = await Law.find({ enable: "true", type: "state" }).distinct("state");
      res.json(states);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 8: Fetch all active laws by state with type = 'state' [/api/laws/fetchActiveLawsByState]
router.get(
  "/fetchActiveLawsByState",
  [
    query("state", "State is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { state } = req.query;
      const stateLaws = await Law.find({ enable: "true", type: "state", state });
      res.json(stateLaws);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


module.exports = router;
