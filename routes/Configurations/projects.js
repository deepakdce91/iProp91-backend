const express = require("express");
const { body, query, validationResult } = require('express-validator');
const Projects = require("../../models/configurations/Projects"); 
const fetchUser = require("../../middleware/fetchUser"); 
const router = express.Router();

// ROUTE 0: Get single project by ID [/api/projects/fetchproject/:id]
router.get("/fetchproject/:id", [
    fetchUser,
    query("userId", "userId is required").exists(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const project = await Projects.findById(req.params.id);
        res.json(project);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 1: Get all projects [/api/projects/fetchallprojects]
router.get("/fetchallprojects", [
    fetchUser,
    query("userId", "userId is required").exists(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const projects = await Projects.find();
        res.json(projects);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 2: Add a new project [/api/projects/addproject]
router.post("/addproject", [
    fetchUser,
    query("userId", "userId is required").exists(),
    body("name", "Please enter a name").exists(),
    body("state", "State is required").exists(),
    body("city", "City is required").exists(),
    body("builder", "Builder is required").exists(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, state, city, builder, enable, addedBy } = req.body;

        const project = new Projects({
            name,
            state,
            city,
            builder,
            enable: enable || "no",
            addedBy: addedBy || "Unknown"
        });

        const savedProject = await project.save();
        res.json(savedProject);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 3: Update an existing project by ID [/api/projects/updateproject/:id]
router.put("/updateproject/:id", [
    fetchUser,
    query("userId", "userId is required").exists(),
], async (req, res) => {
    const { name, state, city, builder, enable, addedBy } = req.body;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updatedProject = {};
        if (name) updatedProject.name = name;
        if (state) updatedProject.state = state;
        if (city) updatedProject.city = city;
        if (builder) updatedProject.builder = builder;
        if (enable) updatedProject.enable = enable;
        if (addedBy) updatedProject.addedBy = addedBy;

        const project = await Projects.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }

        const projectUpdate = await Projects.findByIdAndUpdate(req.params.id, { $set: updatedProject }, { new: true });
        res.json(projectUpdate);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 4: Delete an existing project by ID [/api/projects/deleteproject/:id]
router.delete("/deleteproject/:id", [
    fetchUser,
    query("userId", "userId is required").exists(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const project = await Projects.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }

        const deletedProject = await Projects.findByIdAndDelete(req.params.id);
        res.json({ Success: "Project has been deleted.", deletedProject });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 5: Get project by builder [/api/projects/fetchprojectbybuilder/:builder]
router.get("/fetchprojectbybuilder/:builder", [
    fetchUser,
    query("userId", "userId is required").exists(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const project = await Projects.find({ builder: req.params.builder });
        res.json(project);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

module.exports = router;
