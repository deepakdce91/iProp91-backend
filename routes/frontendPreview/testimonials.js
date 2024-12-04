const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const Testimonial = require("../../models/frontendPreview/Testimonials");
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// Route 0: Get a single testimonial by ID [/api/testimonials/fetchTestimonial/:id]
router.get(
  "/fetchTestimonial/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Testimonial Id.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await Testimonial.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Testimonial not found." });
      res.json(item);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 1: Get all testimonials [/api/testimonials/fetchAllTestimonials]
router.get(
  "/fetchAllTestimonials",
  fetchUser,
  [query("userId", "Invalid or missing userId").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Testimonial.find();
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 2: Add a new testimonial [/api/testimonials/addTestimonial]
router.post(
  "/addTestimonial",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    body("testimonial", "Testimonial content is required").exists(),
    body("userInfo.id", "User ID is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { testimonial, userInfo, enable } = req.body;

      const newTestimonial = new Testimonial({
        testimonial,
        userInfo,
        enable: enable || "no",
      });

      const savedItem = await newTestimonial.save();
      res.json(savedItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3: Update an existing testimonial by ID [/api/testimonials/updateTestimonial/:id]
router.put(
  "/updateTestimonial/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Testimonial Id.").exists(),
  ],
  async (req, res) => {
    const { title, testimonial, userInfo, enable } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedTestimonial = {};
      if (testimonial) updatedTestimonial.testimonial = testimonial;
      if (userInfo) updatedTestimonial.userInfo = userInfo;
      if (enable) updatedTestimonial.enable = enable;

      const item = await Testimonial.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Testimonial not found." });

      const updatedTestimonialItem = await Testimonial.findByIdAndUpdate(
        req.params.id,
        { $set: updatedTestimonial },
        { new: true }
      );
      res.json(updatedTestimonialItem);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 4: Delete a testimonial by ID [/api/testimonials/deleteTestimonial/:id]
router.delete(
  "/deleteTestimonial/:id",
  fetchUser,
  [
    query("userId", "Invalid or missing userId").exists(),
    param("id", "Provide Testimonial Id.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await Testimonial.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Testimonial not found." });

      const deletedItem = await Testimonial.findByIdAndDelete(req.params.id);
      res.json({ Success: "Testimonial has been deleted.", deletedItem });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 5: Fetch all active testimonials (enabled) [/api/testimonials/fetchAllActiveTestimonials]
router.get(
  "/fetchAllActiveTestimonials",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const items = await Testimonial.find({ enable: "yes" });
      res.json(items);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;
