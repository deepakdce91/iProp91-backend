const express = require("express");
const { body, validationResult,query, param } = require("express-validator");
const ContactUs = require("../../models/frontendPreview/ContactUs");
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Fetch a single contact entry by ID [/api/contactUs/fetchContact/:id]
router.get(
  "/fetchContactUs/:id",
  fetchUser,
  [ query("userId", "Invalid or missing userId").exists() ,
    param("id", "Provide a valid Contact ID").isMongoId(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const contact = await ContactUs.findById(req.params.id);
      if (!contact) return res.status(404).json({ error: "Contact not found." });
      res.json(contact);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Fetch all contact entries [/api/contactUs/fetchAllContacts]
router.get(
  "/fetchAllContactUs",
  fetchUser,
  [ query("userId", "Invalid or missing userId").exists()],
  async (req, res) => {
    try {
      const contacts = await ContactUs.find();
      res.json(contacts);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new contact entry [/api/contactUs/addContact]
router.post(
  "/addContactUs",
  [
    body("name", "Name is required").isString().notEmpty(),
    body("mobile", "Valid mobile number is required").isString().notEmpty(),
    body("email", "Valid email is required").isEmail(),
    body("message", "Message is required").isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, mobile, email, message } = req.body;

      const newContact = new ContactUs({
        name,
        mobile,
        email,
        message,
      });

      const savedContact = await newContact.save();
      res.json(savedContact);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update a contact entry by ID [/api/contactUs/updateContact/:id]
router.put(
  "/updateContactUs/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide a valid Contact ID").isMongoId(),
    body("name").optional().isString(),
    body("mobile").optional().isString(),
    body("email").optional().isEmail(),
    body("message").optional().isString(),
    body("addressed").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updateFields = req.body;

      const contact = await ContactUs.findById(req.params.id);
      if (!contact) return res.status(404).json({ error: "Contact not found." });

      const updatedContact = await ContactUs.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      );
      res.json(updatedContact);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete a contact entry by ID [/api/contactUs/deleteContact/:id]
router.delete(
  "/deleteContactUs/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide a valid Contact ID").isMongoId(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const contact = await ContactUs.findById(req.params.id);
      if (!contact) return res.status(404).json({ error: "Contact not found." });

      const deletedContact = await ContactUs.findByIdAndDelete(req.params.id);
      res.json({ success: "Contact has been deleted.", deletedContact });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


module.exports = router;
