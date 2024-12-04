const express = require("express");
const { body, validationResult, query } = require('express-validator');
const DocumentType = require("../../models/configurations/DocumentType"); 
const fetchUser = require("../../middleware/fetchUser"); 
const router = express.Router();

// ROUTE 0: GET a single document type by ID [/api/documentType/fetchDocumentType/:id]
router.get("/fetchDocumentType/:id", [
    fetchUser, 
    query("userId", "userId is required").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const documentType = await DocumentType.findById(req.params.id);
        if (!documentType) {
            return res.status(404).json({ error: "Document Type not found." });
        }
        res.json(documentType);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 1: GET all document types [/api/documentType/fetchallDocumentTypes]
router.get("/fetchallDocumentTypes", [
    fetchUser, 
    query("userId", "userId is required").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const documentTypes = await DocumentType.find();
        res.json(documentTypes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 2: POST to add a new document type [/api/documentType/addDocumentType]
router.post("/addDocumentType", [
    fetchUser, 
    query("userId", "userId is required").exists(),
    body("name", "Please enter a name").exists(),
    body("enable", "Please specify enable status").isIn(['yes', 'no'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, enable, addedBy } = req.body;

        // Create new document type
        const documentType = new DocumentType({
            name,
            enable: enable || "no",
            addedBy: addedBy || "Unknown"
        });

        const savedDocumentType = await documentType.save();
        res.json(savedDocumentType);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 3: PUT to update an existing document type by ID [/api/documentType/updateDocumentType/:id]
router.put("/updateDocumentType/:id", [
    fetchUser, 
    query("userId", "userId is required").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, enable, addedBy } = req.body;

    try {
        const updatedDocumentType = {};
        if (name) updatedDocumentType.name = name;
        if (enable) updatedDocumentType.enable = enable;
        if (addedBy) updatedDocumentType.addedBy = addedBy;

        const documentType = await DocumentType.findById(req.params.id);
        if (!documentType) {
            return res.status(404).json({ error: "Document Type not found." });
        }

        const documentTypeUpdate = await DocumentType.findByIdAndUpdate(
            req.params.id, 
            { $set: updatedDocumentType }, 
            { new: true }
        );
        res.json(documentTypeUpdate);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

// ROUTE 4: DELETE an existing document type by ID [/api/documentType/deleteDocumentType/:id]
router.delete("/deleteDocumentType/:id", [
    fetchUser, 
    query("userId", "userId is required").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const documentType = await DocumentType.findById(req.params.id);
        if (!documentType) {
            return res.status(404).json({ error: "Document Type not found." });
        }

        const deletedDocumentType = await DocumentType.findByIdAndDelete(req.params.id);
        res.json({ Success: "Document Type has been deleted.", deletedDocumentType });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
    }
});

module.exports = router;
