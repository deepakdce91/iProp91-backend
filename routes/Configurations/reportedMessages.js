const express = require("express");
const { body, query, param, validationResult } = require("express-validator");
const ReportedMessage = require("../../models/configurations/ReportedMessages");
const Messages = require("../../models/configurations/Messages");
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// ROUTE 1: GET all reported messages [/api/reported-messages/fetchAllMessages]
router.get(
  "/fetchAllReportedMessages",
  [
    fetchUser,
    query("userId", "userId is required").exists(), // Validation for userId in query
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      try {
        const messages = await ReportedMessage.find();
        res.json(messages);
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
      }
    }
  }
);

// ROUTE 2: POST to add a new reported message [/api/reported-messages/addMessage]
router.post(
  "/addReportedMessage",
  [
    fetchUser,
    query("userId", "userId is required").exists(), // Validation for userId in query
    body("groupName", "Group name is required").exists(),
    body("message", "Message content is required").exists(),
    body("reportedBy", "User ID of the reporter is required").exists(),
    body("messageBy", "User ID of the message sender is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { groupName, message, reportedBy, messageBy } = req.body;

      // Create new reported message
      const newReportedMessage = new ReportedMessage({
        groupName,
        message,
        reportedBy,
        messageBy,
      });

      const savedMessage = await newReportedMessage.save();
      res.json(savedMessage);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 4: DELETE an existing reported message by ID [/api/reported-messages/deleteMessage/:id]
router.delete(
  "/deleteReportedMessage/:id",
  [
    fetchUser,
    [
      query("userId", "userId is required").exists(),
      param("id", "id is required").exists(),
      query("messageId", "messageId is required").exists(),
      query("communityId", "communityId is required").exists(),
    ], // Validation for userId in query
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { communityId, messageId } = req.query;
      const message = await ReportedMessage.findById(req.params.id);
      if (!message) {
        return res.status(200).json({ error: "Reported message not found." });
      }

      const deletedMessage = await ReportedMessage.findByIdAndDelete(
        req.params.id
      );
      if (deletedMessage) {
        // Fetch the message collection by communityId
        const messageCollection = await Messages.findOne({ communityId });

        // Check if the message collection exists
        if (!messageCollection) {
          res.json({
            success: false,
            message: "Could not find message collection to unflag.",
          });
        }

        // Find the message in the community's messages array by messageId
        const message = messageCollection.messages.id(messageId);
        if (!message) {
          res.json({
            success: false,
            message: "Could not find message to unflag .",
          });
        }

        // Unflag the message
        message.flag = "false";

        // Save the updated message collection
        const messageUnflagged = await messageCollection.save();

        if (!messageUnflagged) {
          res.json({ success: false, message: "Could not unflag message." });
        } else {
          res.json({
            success: true,
            message: "Reported message has been deleted.",
          });
        }
      } else {
        res.json({ success: false, message: "Couldn't find the message." });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE5 : Set actionTaken as true for a reported message
router.put(
  "/setActionTaken/:groupId/:messageId",
  fetchUser,
  [
    param("groupId", "GroupId is required").exists(),
    param("messageId", "MessageId is required").exists(),
  ],
  async (req, res) => {
    const { groupId, messageId } = req.params;

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); 
      }

      // Find the reported message by groupId and messageId and update actionTaken to "true"
      const reportedMessage = await ReportedMessage.findOneAndUpdate(
        { groupId, messageId },
        { $set: { actionTaken: "true" } },
        { new: true }
      );

      if (!reportedMessage) {
        return res.json({ success: false, message : "Reported message not found" });
      }

      res.json({ success: true, message : "Action taken on the message." });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


module.exports = router;
