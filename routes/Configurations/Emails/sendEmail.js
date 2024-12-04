
const express = require("express");
const { body, validationResult, query, param } = require("express-validator");
const EmailTemplate = require("../../../models/configurations/EmailTemplates"); // Adjust path as needed
const fetchUser = require("../../../middleware/fetchUser");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv");

async function sendEmail(to, subject, body) {
  try {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port : 465,
      auth: {
        user: process.env.SENDER_ADDRESS, 
        pass: process.env.GMAIL_PASSWORD, 
      },
    });

    // Define email options
    const mailOptions = {
      from: `"iProp91" ${process.env.SENDER_ADDRESS}"`, 
      to, // List of receivers
      subject, 
    //   text : "My textttt", 
      html : body, // HTML body
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// Example usage
sendEmail()
  .then((info) => console.log("Email sent successfully:", info))
  .catch((error) => console.error("Failed to send email:", error));


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


//Add a new email template [/api/mailService/sendEmail] 
// fields -> 
router.post(
  "/sendEmail",
  [
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


module.exports = router;
