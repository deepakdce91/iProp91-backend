const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const EmailTemplate = require("../../../models/configurations/EmailTemplates"); // Adjust path as needed
const fetchUser = require("../../../middleware/fetchUser");
const router = express.Router();

function processIpropVariables(input) {
  // Match words starting with "IPROP_VAR_" using a regular expression
  const matches = input.match(/\bIPROP_VAR_\w+\b/g) || [];

  // Count the number of occurrences
  const totalVariables = matches.length;

  // Create a comma-separated string of the variables
  const variableNames = matches.join(',');


  // Return the result as an object
  return { totalVariables, variableNames };
}

// Route 0: Get a single email template item by ID [/api/email/fetchTemplate/:id]
router.get(
  "/fetchEmailTemplate/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Template Id.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const template = await EmailTemplate.findById(req.params.id);
      if (!template) return res.status(404).json({ error: "Template not found." });
      res.json(template);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Get all email template items [/api/email/fetchAllTemplates]
router.get(
  "/fetchAllEmailTemplates",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
  ],
  async (req, res) => {
    try {
      const templates = await EmailTemplate.find();
      res.json(templates);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new email template [/api/email/addTemplate]
router.post(
  "/addEmailTemplate",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("templateName", "Template Name is required").exists(),
    body("subject", "Subject is required").exists(),
    body("body", "Body is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { templateName, subject, body, enable } = req.body;

      const { totalVariables, variableNames } = processIpropVariables(body);

      const newTemplate = new EmailTemplate({
        templateName,
        subject,
        body,
        totalVariables,
        variableNames,
        enable: enable || "true",
      });

      const savedTemplate = await newTemplate.save();
      res.json(savedTemplate);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing email template by ID [/api/email/updateTemplate/:id]
router.put(
  "/updateEmailTemplate/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Template ID.").exists(),
  ],
  async (req, res) => {
    const { templateName, subject, body, enable } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedTemplate = {};
      if (templateName) updatedTemplate.templateName = templateName;
      if (subject) updatedTemplate.subject = subject;
      if (body){ 
        const { totalVariables, variableNames } = processIpropVariables(body);
        updatedTemplate.totalVariables = totalVariables;
        updatedTemplate.variableNames = variableNames;
        updatedTemplate.body = body;
      }
      if (enable) updatedTemplate.enable = enable;

      const emailTemplate = await EmailTemplate.findById(req.params.id);
      if (!emailTemplate) return res.status(404).json({ error: "Template not found." });

      const updatedEmailTemplate = await EmailTemplate.findByIdAndUpdate(
        req.params.id,
        { $set: updatedTemplate },
        { new: true }
      );
      res.json(updatedEmailTemplate);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete an email template by ID [/api/email/deleteTemplate/:id]
router.delete(
  "/deleteEmailTemplate/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Template ID.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const emailTemplate = await EmailTemplate.findById(req.params.id);
      if (!emailTemplate) return res.status(404).json({ error: "Template not found." });

      const deletedTemplate = await EmailTemplate.findByIdAndDelete(req.params.id);
      res.json({ success: "Template has been deleted.", deletedTemplate });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


module.exports = router;
