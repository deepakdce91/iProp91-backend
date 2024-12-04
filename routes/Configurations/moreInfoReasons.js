const express = require("express");
const { body, query, validationResult } = require('express-validator');
const MoreInfoReason = require("../../models/configurations/MoreInfoReasons"); 
const fetchUser = require("../../middleware/fetchUser"); 
const router = express.Router();

// ROUTE 0: GET a single reason by ID [/api/more-info-reason/fetchReason/:id]
router.get("/fetchReason/:id", [
    fetchUser, 
    query('userId', 'userId is required').exists()  // Validation for userId in query
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const reason = await MoreInfoReason.findById(req.params.id);
        if (!reason) {
            return res.status(404).json({ error: "Reason not found." });
        }
        res.json(reason);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 1: GET all reasons [/api/more-info-reason/fetchAllReasons]
router.get("/fetchAllReasons", [
    fetchUser, 
    query('userId', 'userId is required').exists()  // Validation for userId in query
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const reasons = await MoreInfoReason.find();
        res.json(reasons);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 2: POST to add a new reason [/api/more-info-reason/addReason]
router.post("/addReason", [
    fetchUser,
    query('userId', 'userId is required').exists(),  // Validation for userId in query
    body("name", "Please enter a name").exists(),
    body("enable", "Please specify enable status").isIn(['yes', 'no'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Destructure request body
        const { name, enable, addedBy } = req.body;

        // Create new reason
        const reason = new MoreInfoReason({
            name,
            enable: enable || "no",
            addedBy: addedBy || "Unknown"
        });

        const savedReason = await reason.save();
        res.json(savedReason);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 3: PUT to update an existing reason by ID [/api/more-info-reason/updateReason/:id]
router.put("/updateReason/:id", [
    fetchUser,
    query('userId', 'userId is required').exists()  // Validation for userId in query
], async (req, res) => {
    const { name, enable, addedBy } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Build updated reason object
        const updatedReason = {};
        if (name) updatedReason.name = name;
        if (enable) updatedReason.enable = enable;
        if (addedBy) updatedReason.addedBy = addedBy;

        // Find reason by ID and update
        const reason = await MoreInfoReason.findById(req.params.id);
        if (!reason) {
            return res.status(404).json({ error: "Reason not found." });
        }

        const reasonUpdate = await MoreInfoReason.findByIdAndUpdate(req.params.id, { $set: updatedReason }, { new: true });
        res.json(reasonUpdate);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 4: DELETE an existing reason by ID [/api/more-info-reason/deleteReason/:id]
router.delete("/deleteReason/:id", [
    fetchUser,
    query('userId', 'userId is required').exists()  // Validation for userId in query
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Find reason by ID and delete
        const reason = await MoreInfoReason.findById(req.params.id);
        if (!reason) {
            return res.status(404).json({ error: "Reason not found." });
        }

        const deletedReason = await MoreInfoReason.findByIdAndDelete(req.params.id);
        res.json({ Success: "Reason has been deleted.", deletedReason });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

module.exports = router;
