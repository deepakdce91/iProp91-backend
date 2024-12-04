const express = require("express");
const fetchUser = require("../../middleware/fetchUser");
const { body, validationResult, query } = require("express-validator");
const States = require("../../models/configurations/State");
const router = express.Router();

// Route 0 : Get single state by ID with fetchUser and query validation for userId
router.get(
  "/fetchState/:id",
  fetchUser,
  [
    query("userId", "userId is required and should be a valid string")
      .isString()
      .notEmpty(),
  ],
  async (req, res) => {
    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const state = await States.findById(req.params.id);
      res.json(state);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 1: GET all states with fetchUser and query validation for userId
router.get(
  "/fetchallstates",
  fetchUser,
  [
    query("userId", "userId is required and should be a valid string")
      .isString()
      .notEmpty(),
  ],
  async (req, res) => {
    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const states = await States.find();
      res.json(states);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 2: POST to add a new state with fetchUser and query validation for userId
router.post(
  "/addstate",
  fetchUser,
  [
    query("userId", "userId is required and should be a valid string")
      .isString()
      .notEmpty(),
    body("name", "Please enter a name").exists(),
  ],
  async (req, res) => {
    try {
      // Validate request body and query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Destructure request body
      const { name, enable, addedBy } = req.body;

      // Create new state
      const state = new States({
        name,
        enable: enable || "no",
        addedBy: addedBy || "Unknown",
      });

      const savedState = await state.save();
      res.json(savedState);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 3: PUT to update an existing state by ID with fetchUser and query validation for userId
router.put(
  "/updatestate/:id",
  fetchUser,
  [
    query("userId", "userId is required and should be a valid string")
      .isString()
      .notEmpty(),
  ],
  async (req, res) => {
    const { name, enable, addedBy } = req.body;
    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Build updated state object
      const updatedState = {};
      if (name) updatedState.name = name;
      if (enable) updatedState.enable = enable;
      if (addedBy) updatedState.addedBy = addedBy;

      // Find state by ID and update
      const state = await States.findById(req.params.id);
      if (!state) {
        return res.status(404).json({ error: "State not found." });
      }

      const stateUpdate = await States.findByIdAndUpdate(
        req.params.id,
        { $set: updatedState },
        { new: true }
      );
      res.json(stateUpdate);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 4: DELETE an existing state by ID with fetchUser and query validation for userId
router.delete(
  "/deletestate/:id",
  fetchUser,
  [
    query("userId", "userId is required and should be a valid string")
      .isString()
      .notEmpty(),
  ],
  async (req, res) => {
    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find state by ID and delete
      const state = await States.findById(req.params.id);
      if (!state) {
        return res.status(404).json({ error: "State not found." });
      }

      const deletedState = await States.findByIdAndDelete(req.params.id);
      res.json({ Success: "State has been deleted.", deletedState });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
