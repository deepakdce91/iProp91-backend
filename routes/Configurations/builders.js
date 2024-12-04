const express = require("express");
const { body, query, validationResult } = require('express-validator');
const Builders = require("../../models/configurations/Builders"); 
const fetchUser = require("../../middleware/fetchUser"); 
const router = express.Router();

// Route 0 : GET single builder [/api/builders/fetchbuilder/:id]
router.get("/fetchbuilder/:id", [
    fetchUser,
    query('userId', 'userId is required').exists(),
], async (req, res) => {
    try {
        // Validate query parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const builder = await Builders.findById(req.params.id);
        res.json(builder);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 1: GET all builders [/api/builders/fetchallbuilders]
router.get("/fetchallbuilders", [
    fetchUser,
    query('userId', 'userId is required').exists(),
], async (req, res) => {
    try {
        // Validate query parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const builders = await Builders.find();
        res.json(builders);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 2: POST to add a new builder [/api/builders/addbuilder]
router.post("/addbuilder", [
    fetchUser,
    query('userId', 'userId is required').exists(),
    body("name", "Please enter a name").exists(),
    body("state", "State is required").exists(),
    body("city", "City is required").exists(),
], async (req, res) => {
    try {
        // Validate request body and query parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Destructure request body
        const { name, state, city, enable, addedBy } = req.body;

        // Create new builder
        const builder = new Builders({
            name,
            state,
            city,
            enable: enable || "no",
            addedBy: addedBy || "Unknown"
        });

        const savedBuilder = await builder.save();
        res.json(savedBuilder);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 3: PUT to update an existing builder by ID [/api/builders/updatebuilder/:id]
router.put("/updatebuilder/:id", [
    fetchUser,
    query('userId', 'userId is required').exists(),
], async (req, res) => {
    const { name, state, city, enable, addedBy } = req.body;

    try {
        // Build updated builder object
        const updatedBuilder = {};
        if (name) updatedBuilder.name = name;
        if (state) updatedBuilder.state = state;
        if (city) updatedBuilder.city = city;
        if (enable) updatedBuilder.enable = enable;
        if (addedBy) updatedBuilder.addedBy = addedBy;

        // Find builder by ID and update
        const builder = await Builders.findById(req.params.id);
        if (!builder) {
            return res.status(404).json({ error: "Builder not found." });
        }

        const builderUpdate = await Builders.findByIdAndUpdate(req.params.id, { $set: updatedBuilder }, { new: true });
        res.json(builderUpdate);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 4: DELETE an existing builder by ID [/api/builders/deletebuilder/:id]
router.delete("/deletebuilder/:id", [
    fetchUser,
    query('userId', 'userId is required').exists(),
], async (req, res) => {
    try {
        // Validate query parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Find builder by ID and delete
        const builder = await Builders.findById(req.params.id);
        if (!builder) {
            return res.status(404).json({ error: "Builder not found." });
        }

        const deletedBuilder = await Builders.findByIdAndDelete(req.params.id);
        res.json({ Success: "Builder has been deleted.", deletedBuilder });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// Route 5 : GET builders by city [/api/builders/fetchbuildersbycity/:city]
router.get("/fetchbuildersbycity/:city", [
    fetchUser,
    query('userId', 'userId is required').exists(),
], async (req, res) => {
    try {
        // Validate query parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const builders = await Builders.find({ city: req.params.city });
        res.json(builders);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

module.exports = router;
