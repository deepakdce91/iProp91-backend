const express = require("express");
const { body, validationResult, query } = require('express-validator');
const City = require("../../models/configurations/City"); 
const fetchUser = require("../../middleware/fetchUser"); 
const router = express.Router();

// Route 0 : Get single city [/api/city/fetchcity/:id]
router.get(
    "/fetchcity/:id", 
    fetchUser, 
    [query('userId', 'Invalid or missing userId').exists()],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            const city = await City.findById(req.params.id);
            res.json(city);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error.");
        }
    }
);

// ROUTE 1: Get all cities [/api/city/fetchallcities]
router.get(
    "/fetchallcities", 
    fetchUser, 
    [query('userId', 'Invalid or missing userId').exists()],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const cities = await City.find();
            res.json(cities);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error.");
        }
    }
);

// ROUTE 2: Add a new city [/api/city/addcity]
router.post(
    "/addcity", 
    fetchUser,
    [
        query('userId', 'Invalid or missing userId').exists(),
        body("name", "Please enter a name").exists(),
        body("state", "State is required").exists()
    ], 
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, state, enable, addedBy } = req.body;

            const city = new City({
                name,
                state,
                enable: enable || "no",
                addedBy: addedBy || "Unknown"
            });

            const savedCity = await city.save();
            res.json(savedCity);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error.");
        }
    }
);

// ROUTE 3: Update an existing city by ID [/api/city/updatecity/:id]
router.put(
    "/updatecity/:id", 
    fetchUser, 
    [query('userId', 'Invalid or missing userId').exists()], 
    async (req, res) => {
        const { name, state, enable, addedBy } = req.body;

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const updatedCity = {};
            if (name) updatedCity.name = name;
            if (state) updatedCity.state = state;
            if (enable) updatedCity.enable = enable;
            if (addedBy) updatedCity.addedBy = addedBy;

            const city = await City.findById(req.params.id);
            if (!city) {
                return res.status(404).json({ error: "City not found." });
            }

            const cityUpdate = await City.findByIdAndUpdate(req.params.id, { $set: updatedCity }, { new: true });
            res.json(cityUpdate);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error.");
        }
    }
);

// ROUTE 4: Delete a city by ID [/api/city/deletecity/:id]
router.delete(
    "/deletecity/:id", 
    fetchUser, 
    [query('userId', 'Invalid or missing userId').exists()], 
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const city = await City.findById(req.params.id);
            if (!city) {
                return res.status(404).json({ error: "City not found." });
            }

            const deletedCity = await City.findByIdAndDelete(req.params.id);
            res.json({ Success: "City has been deleted.", deletedCity });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error.");
        }
    }
);

// Route 5: Get cities linked with a state [/api/city/fetchcitiesbystate/:state]
router.get(
    "/fetchcitiesbystate/:state", 
    fetchUser, 
    [query('userId', 'Invalid or missing userId').exists()], 
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const cities = await City.find({ state: req.params.state });
            res.json(cities);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error.");
        }
    }
);

module.exports = router;
