const express = require("express");
const fetchUser = require("../../middleware/fetchUser");
const { body, param, query, validationResult } = require("express-validator");
const Messages = require("../../models/configurations/Messages"); // Assuming this is your model path
const router = express.Router();

// ROUTE0: Fetch a single message from a community
router.get(
  "/getSingleMessage/:communityId/:messageId",
  fetchUser,
  [
    query('userId', 'Invalid or missing userId').exists(),
    param("communityId", "CommunityId is required").exists(),
    param("messageId", "MessageId is required").exists(),
  ],
  async (req, res) => {
    const { communityId, messageId } = req.params;

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find the community by communityId and the message by messageId
      const messageCollection = await Messages.findOne({ communityId });
      if (!messageCollection) {
        return  res.json({ success: false, message : "Message collection not found." });
      }

      // Find the specific message in the messages array
      const message = messageCollection.messages.id(messageId);
      if (!message) {
        return  res.json({ success: false, message : "Message not found." });
      }

      // Return the found message
      res.json({ success: true, message });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


//ROUTE 1 get all messages of a collection
router.get(
    "/getMessages/:communityId",
    fetchUser,
    [
        query('userId', 'Invalid or missing userId').exists(),
      param("communityId", "CommunityId is required").exists(),
    ],
    async (req, res) => {
      const { communityId } = req.params;
  
      try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        // Fetch all messages for the community
        const messageCollection = await Messages.findOne({ communityId });
        if (!messageCollection || messageCollection.messages.length === 0) {
          return res.status(404).json({ error: "No messages found for this community." });
        }
  
        res.json({ success: true, messages: messageCollection.messages });
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
      }
    }
  );


  //ROUTE 2 create a messages collection
  router.post(
    "/createMessagesCollection",
    fetchUser,
    [
        query('userId', 'Invalid or missing userId').exists(),
      body("communityId", "CommunityId is required").exists(),
    ],
    async (req, res) => {
      const { communityId } = req.body;
  
      try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        let messageCollection = await Messages.findOne({ communityId });
        if (messageCollection) {
          return res.status(400).json({ success: false, message: "Messages collection already exists for this community." });
        }
  
        // Create new message collection
        messageCollection = new Messages({ communityId });
        await messageCollection.save();
        res.json({ success: true, message: "Messages collection created." });
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
      }
    }
  );

  // ROUTE 3: Delete a message from messages array
router.delete(
  "/deleteMessage/:communityId/:messageId",
  fetchUser,
  [
    query('userId', 'Invalid or missing userId').exists(),
    param("communityId", "CommunityId is required").exists(),
    param("messageId", "MessageId is required").exists(),
  ],
  async (req, res) => {
    const { communityId, messageId } = req.params;

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find the community by communityId and remove the message with messageId from the array
      const messageCollection = await Messages.findOneAndUpdate(
        { communityId },
        { $pull: { messages: { _id: messageId } } },
        { new: true }
      );

      if (!messageCollection) {
        return res.status(200).json({ success : false , message: "Community or message not found." });
      }

      res.json({ success: true, message: "Message deleted!" });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);


// ROUTE 4: Toggle flag of a message in messages array
router.put(
  "/toggleFlag/:communityId/:messageId",
  fetchUser,
  [
    query('userId', 'Invalid or missing userId').exists(),
    param("communityId", "CommunityId is required").exists(),
    param("messageId", "MessageId is required").exists(),
  ],
  async (req, res) => {
    const { communityId, messageId } = req.params;

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Find the community and the specific message
      const messageCollection = await Messages.findOne({ communityId });
      if (!messageCollection) {
        return res.json({ success: false, message: "Message collection not found." });
      }

      // Find the message by its _id
      const message = messageCollection.messages.id(messageId);
      if (!message) {
        return res.json({ success: false, message: "Message not found." });
      }

      // Toggle the flag manually
      message.flag = message.flag === "true" ? "false" : "true";

      // Save the updated document
      await messageCollection.save();

      res.json({ success: true, message: "Message flag status changed." });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);



  
  module.exports = router;