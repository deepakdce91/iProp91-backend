const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const QuestionBuilder = require("../../models/frontendPreview/QuestionBuilder"); 
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Fetch a single entry by ID [/api/questions/fetchQuestion/:id]
router.get(
  "/fetchQuestion/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide ID").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await QuestionBuilder.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Entry not found." });
      res.json(item);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Fetch all entries [/api/questions/fetchAllQuestions]
router.get(
  "/fetchAllQuestions",
  fetchUser,
  async (req, res) => {
    try {
      const items = await QuestionBuilder.find();
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new entry [/api/questions/addQuestion]
router.post(
  "/addQuestion",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("data", "Data array is required").isArray().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { data } = req.body;

      const newEntry = new QuestionBuilder({
        data,
      });

      const savedEntry = await newEntry.save();
      res.json(savedEntry);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing entry by ID [/api/questions/updateQuestion/:id]
router.put(
  "/updateQuestion/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide ID").exists(),
    body("data", "Data must be an array").optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { data } = req.body;

      const updatedFields = {};
      if (data) updatedFields.data = data;

      const existingEntry = await QuestionBuilder.findById(req.params.id);
      if (!existingEntry) return res.status(404).json({ error: "Entry not found." });

      const updatedEntry = await QuestionBuilder.findByIdAndUpdate(
        req.params.id,
        { $set: updatedFields },
        { new: true }
      );

      res.json(updatedEntry);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete an entry by ID [/api/questions/deleteQuestion/:id]
router.delete(
  "/deleteQuestion/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide ID").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existingEntry = await QuestionBuilder.findById(req.params.id);
      if (!existingEntry) return res.status(404).json({ error: "Entry not found." });

      const deletedEntry = await QuestionBuilder.findByIdAndDelete(req.params.id);
      res.json({ success: "Entry has been deleted.", deletedEntry });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


// Route 5: Fetch all enabled mobile tiles [/api/mobileTiles/fetchAllQuestionsForCustomerJourney]
router.get(
    "/fetchAllQuestionsForCustomerJourney",
    async (req, res) => {
      try {
        const items = await QuestionBuilder.find();
        res.json(items);
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
      }
    }
  );
  

module.exports = router;
