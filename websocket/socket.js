// socket.js
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/configurations/Messages");
const Community = require("../models/configurations/Communities");
const ReportedMessages = require("../models/configurations/ReportedMessages");

const secretKey = process.env.JWT_KEY;

const verifySocketAuth = (token, userId, socket) => {
  if (!token) {
    return false;
  } else {
    const data = jwt.verify(token, secretKey);
    if (data.userId !== userId) {
      return false;
    } else {
      return true;
    }
  }
};

const initializeWebSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: [
        "https://iprop91-admin.vercel.app",
        "http://localhost:5001",
        "https://i-prop91-frontend-update.vercel.app",
      ],
      methods: ["GET", "POST", "PUT"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("joinCommunity", ({ communityId, userId, userToken }) => {
      // verification middleware
      if (verifySocketAuth(userToken, userId, socket) === true) {
        socket.join(communityId);
        console.log(`User joined community: ${communityId}`);

        // Fetch existing messages for the community
        Message.findOne({ communityId }).then((data) => {
          socket.emit(`existingMessages-${communityId}`, data);
        });
      } else {
        return socket.emit("errorMessage", {
          error: "User not authenticated.",
        });
      }
    });

    // Listening for 'sendMessage' event via socket
    socket.on("sendMessage", async (messageData) => {
      const { communityId, userToken } = messageData;
      const { text, userId, userName, file, userProfilePicture } =
        messageData.message;

      try {
        if (verifySocketAuth(userToken, userId, socket) === true) {
          // Fetch the message collection by communityId
          const messageCollection = await Message.findOne({ communityId });

          // Check if community exists
          if (!messageCollection) {
            return socket.emit("errorMessage", {
              error: "Community not found.",
            });
          }

          // Create the new message object
          const newMessage = { userId, userName };
          if (text) newMessage.text = text;
          if (file) newMessage.file = file;
          if (userProfilePicture)
            newMessage.userProfilePicture = userProfilePicture;

          // Add the new message to the community's messages array
          messageCollection.messages.push(newMessage);

          // Save the updated message collection
          const updatedMessageCollection = await messageCollection.save();

          // Get the newly added message
          const addedMsg =
            updatedMessageCollection.messages[
              updatedMessageCollection.messages.length - 1
            ];

          // Emit the new message to all users in the community
          io.to(communityId).emit(`newMessage-${communityId}`, {
            communityId,
            message: addedMsg,
          });
        } else {
          return socket.emit("errorMessage", {
            error: "User not authenticated.",
          });
        }
      } catch (error) {
        console.error("Error saving message:", error.message);
        socket.emit("errorMessage", { error: "Internal server error." });
      }
    });

    socket.on(
      "deleteMessage",
      async ({ communityId, messageId, userId, userToken }) => {
        // verification middleware
        try {
          if (verifySocketAuth(userToken, userId, socket) === true) {
            // Validate parameters (manually since there's no req/res validation in Socket.IO)
            if (!communityId || !messageId) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Community not found.",
              });
            } else if (!userId.includes("IPA")) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "You cannot delete message since you are not an admin.",
              });
            } else {
              // Find and update the message collection by removing the message
              const messageCollection = await Message.findOneAndUpdate(
                { communityId },
                { $pull: { messages: { _id: messageId } } }, // Ensure the message belongs to the user
                { new: true }
              );

              if (messageCollection) {
                // Emit the msg id upon deletion
                io.to(communityId).emit(
                  `messageDeleted-${communityId}`,
                  messageId
                );
              }
            }
          } else {
            return socket.emit("errorMessage", {
              error: "User not authenticated.",
            });
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    );

    // Listening for 'flagMessage' event
    socket.on("flagMessage", async (data) => {
      const { communityId, messageId, userId, userToken, reportData } = data;

      // verification middleware
      try {
        if (verifySocketAuth(userToken, userId, socket) === true) {
          if (userId.includes("IPA")) {
            // Fetch the message collection by communityId
            const messageCollection = await Message.findOne({ communityId });

            // Check if the message collection exists
            if (!messageCollection) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Message collection not found.",
              });
            } else {
              // Find the message in the community's messages array by messageId
              const message = messageCollection.messages.id(messageId);
              if (!message) {
                return socket.emit(`errorMessage-${communityId}`, {
                  error: "Message not found.",
                });
              } else {
                // Flag the message
                message.flag = "true";

                // Save the updated message collection
                const savedCollection = await messageCollection.save();
                if (!savedCollection) {
                  return socket.emit(`errorMessage-${communityId}`, {
                    error: "Message could not be flagged.",
                  });
                } else {
                  const newReportedMessage = new ReportedMessages(reportData);
                  const savedReportedMessage = await newReportedMessage.save();

                  if (!savedReportedMessage) {
                    return socket.emit(`errorMessage-${communityId}`, {
                      error: "Message could not be reported.",
                    });
                  } else {
                    // Emit the updated message to all users in the community
                    io.to(communityId).emit(`messageFlagged-${communityId}`, {
                      messageId,
                      flag: message.flag,
                    });
                  }
                }
              }
            }
          } else {
            // Fetch the community by communityId
            const community = await Community.findOne({ _id: communityId });

            // Check if community exists
            if (!community) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Community not found.",
              });
            }

            // Check if the user is in the customers array and is an admin
            const customer = community.customers.find(
              (customer) => customer._id === userId
            );

            if (!customer || customer.admin !== "true") {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "User is not authorized to flag messages.",
              });
            }

            // Fetch the message collection by communityId
            const messageCollection = await Message.findOne({ communityId });

            // Check if the message collection exists
            if (!messageCollection) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Message collection not found.",
              });
            }

            // Find the message in the community's messages array by messageId
            const message = messageCollection.messages.id(messageId);
            if (!message) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Message not found.",
              });
            }

            // Flag the message
            message.flag = "true";

            // Save the updated message collection
            await messageCollection.save();

            // Emit the updated message to all users in the community
            io.to(communityId).emit(`messageFlagged-${communityId}`, {
              messageId,
              flag: message.flag,
            });
          }
        } else {
          return socket.emit(`errorMessage-${communityId}`, {
            error: "User not authenticated.",
          });
        }
      } catch (error) {
        console.error("Error flagging message:", error.message);
        socket.emit("errorMessage", { error: "Internal server error." });
      }
    });

    // Listening for 'unflagMessage' event
    socket.on("unflagMessage", async (data) => {
      const { communityId, messageId, userId, userToken } = data;

      // verification middleware
      try {
        if (verifySocketAuth(userToken, userId, socket) === true) {
          if (userId.includes("IPA")) {
            // Fetch the message collection by communityId
            const messageCollection = await Message.findOne({ communityId });

            // Check if the message collection exists
            if (!messageCollection) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Message collection not found.",
              });
            }

            // Find the message in the community's messages array by messageId
            const message = messageCollection.messages.id(messageId);
            if (!message) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Message not found.",
              });
            }

            // Unflag the message
            message.flag = "false";

            // Save the updated message collection
            const messageUnflagged = await messageCollection.save();
            if (!messageUnflagged) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Unable to remove reported message.",
              });
            } else {
              const deletedMessage = await ReportedMessages.findOneAndDelete({
                messageId,
              });
              if (!deletedMessage) {
                return socket.emit(`errorMessage-${communityId}`, {
                  error: "Unable to cancel reported message.",
                });
              } else {
                // Emit the updated message to all users in the community
                io.to(communityId).emit(`messageUnflagged-${communityId}`, {
                  messageId,
                  flag: message.flag,
                });
              }
            }
          } else {
            // Fetch the community by communityId
            const community = await Community.findOne({ _id: communityId });

            // Check if the community exists
            if (!community) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Community not found.",
              });
            }

            // Check if the user is in the customers array and is an admin
            const customer = community.customers.find(
              (customer) => customer._id === userId
            );

            if (!customer || customer.admin !== "true") {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "User is not authorized to unflag messages.",
              });
            }

            // Fetch the message collection by communityId
            const messageCollection = await Message.findOne({ communityId });

            // Check if the message collection exists
            if (!messageCollection) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Message collection not found.",
              });
            }

            // Find the message in the community's messages array by messageId
            const message = messageCollection.messages.id(messageId);
            if (!message) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Message not found.",
              });
            }

            // Unflag the message
            message.flag = "false";

            // Save the updated message collection
            const messageUnflagged = await messageCollection.save();
            if (!messageUnflagged) {
              return socket.emit(`errorMessage-${communityId}`, {
                error: "Unable to remove reported message.",
              });
            } else {
              const deletedMessage = await ReportedMessages.findOneAndDelete({
                messageId,
              });
              if (!deletedMessage) {
                return socket.emit(`errorMessage-${communityId}`, {
                  error: "Unable to cancel reported message.",
                });
              } else {
                // Emit the updated message to all users in the community
                io.to(communityId).emit(`messageUnflagged-${communityId}`, {
                  messageId,
                  flag: message.flag,
                });
              }
            }
          }
        } else {
          return socket.emit(`errorMessage-${communityId}`, {
            error: "User not authenticated.",
          });
        }
      } catch (error) {
        console.error("Error unflagging message:", error.message);
        socket.emit("errorMessage", { error: "Internal server error." });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

module.exports = initializeWebSocket;
