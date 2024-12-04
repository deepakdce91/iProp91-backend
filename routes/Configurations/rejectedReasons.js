const express = require("express");
const { body, query, validationResult } = require("express-validator");
const RejectedReason = require("../../models/configurations/RejectedReasons"); 
const fetchUser = require("../../middleware/fetchUser"); 
const router = express.Router();

// ROUTE 0: GET a single rejected reason by ID [/api/rejected-reason/fetchReason/:id]
router.get(
  "/fetchReason/:id",
  fetchUser,
  [query("userId", "User ID is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const reason = await RejectedReason.findById(req.params.id);
      if (!reason) {
        return res.status(404).json({ error: "Rejected reason not found." });
      }
      res.json(reason);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 1: GET all rejected reasons [/api/rejected-reason/fetchAllReasons]
router.get(
  "/fetchAllReasons",
  fetchUser,
  [query("userId", "User ID is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const reasons = await RejectedReason.find();
      res.json(reasons);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 2: POST to add a new rejected reason [/api/rejected-reason/addReason]
router.post(
  "/addReason",
  fetchUser,
  [query("userId", "User ID is required").exists(),
    body("name", "Please enter a name").exists(),
    body("enable", "Please specify enable status").isIn(["yes", "no"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, enable, addedBy } = req.body;

      const reason = new RejectedReason({
        name,
        enable: enable || "no",
        addedBy: addedBy || "Unknown",
      });

      const savedReason = await reason.save();
      res.json(savedReason);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 3: PUT to update an existing rejected reason by ID [/api/rejected-reason/updateReason/:id]
router.put(
  "/updateReason/:id",
  fetchUser,
  [query("userId", "User ID is required").exists()],
  async (req, res) => {
    const { name, enable, addedBy } = req.body;

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updatedReason = {};
      if (name) updatedReason.name = name;
      if (enable) updatedReason.enable = enable;
      if (addedBy) updatedReason.addedBy = addedBy;

      const reason = await RejectedReason.findById(req.params.id);
      if (!reason) {
        return res.status(404).json({ error: "Rejected reason not found." });
      }

      const reasonUpdate = await RejectedReason.findByIdAndUpdate(
        req.params.id,
        { $set: updatedReason },
        { new: true }
      );
      res.json(reasonUpdate);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 4: DELETE an existing rejected reason by ID [/api/rejected-reason/deleteReason/:id]
router.delete(
  "/deleteReason/:id",
  fetchUser,
  [query("userId", "User ID is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const reason = await RejectedReason.findById(req.params.id);
      if (!reason) {
        return res.status(404).json({ error: "Rejected reason not found." });
      }

      const deletedReason = await RejectedReason.findByIdAndDelete(
        req.params.id
      );
      res.json({ Success: "Rejected reason has been deleted.", deletedReason });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
