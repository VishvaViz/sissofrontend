const MessageSchema = require("../models/message");

//post the messages

const addMesage = async (req, resp) => {
  const sender = req.body.sender;
  const text = req.body.text;
  const conversationId = req.body.conversationId;
  // console.log(sender,text, conversationId, "sender")
  // Ensure conversationId is defined before creating a new Message
  if (!conversationId || !sender || !text) {
    return resp
      .status(400)
      .json({ success: false, message: "Invalid message data" });
  }
  const newMessage = new MessageSchema({
    conversationId,
    sender,
    text,
  });
  try {
    const savedMessage = await newMessage.save();
    resp
      .status(200)
      .json({ success: true, message: "Message saved", savedMessage });
  } catch (err) {
    resp.status(500).json(err);
  }
};

//get the messages

const getMessage = async (req, resp) => {
  const { conversationId } = req.params;

  const messages = await MessageSchema.find({
    conversationId: conversationId,
  });
  const lastMessage = await MessageSchema.findOne({
    conversationId,
  })
    .sort({ createdAt: -1 })
    .limit(1);
  const unreadCount = await MessageSchema.countDocuments({
    conversationId: conversationId,
    isRead: false,
  });
  try {
    resp
      .status(200)
      .json({
        sucess: true,
        messages: messages,
        lastMessage: lastMessage,
        unReadCount: unreadCount,
      });
  } catch (err) {
    resp.status(500).json(err);
  }
};

const getLastmessage = async (req, resp) => {
  const { conversationId } = req.params;

  try {
    const messages = await MessageSchema.find({
      conversationId: conversationId,
    });
    const lastMessage = await MessageSchema.findOne({ conversationId })
      .sort({ createdAt: -1 })
      .limit(1);
    const unreadCount = await MessageSchema.countDocuments({
      conversationId: conversationId,
      isRead: false,
    });
    resp.json({ success: true, lastMessage: lastMessage, messages: messages, unreadCount: unreadCount});
  } catch (error) {
    console.error("Error fetching last message:", error);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};

// Update message status to read
const updateMessageStatus = async (req, resp) => {
  const { messageId } = req.params;
  console.log("updateMessageStatus");
  try {
    const updatedMessage = await MessageSchema.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    if (!updatedMessage) {
      return resp
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    resp
      .status(200)
      .json({ success: true, message: "Message updated", updatedMessage });
  } catch (error) {
    console.error("Error updating message status:", error);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addMesage, getMessage, getLastmessage, updateMessageStatus };
