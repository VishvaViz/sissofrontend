
const ConversationSchema = require('../models/Conversation')
const mongoose = require('mongoose');

// const User = require('../models/usermodel');
const trainerSchema = require('../models/trainermodel')
const employerSchema = require('../models/employermodel')
const MessageSchema = require('../models/message')

//new conversation 

const newConversation = async (req, resp) => {
    const { senderId, receiverId } = req.body;

    try {
        // Find the sender and receiver based on their IDs
        const sender = (await trainerSchema.findById(senderId)) || (await employerSchema.findById(senderId));
        const receiver = (await trainerSchema.findById(receiverId)) || (await employerSchema.findById(receiverId));

        if (!sender || !receiver) {
            return resp.status(200).json({ success: false, message: 'Sender or receiver not found.' });
        }

        // Check if a conversation already exists between sender and receiver
        const existingConversation = await ConversationSchema.findOne({
            members: {
                $all: [
                    { $elemMatch: { _id: sender._id } },
                    { $elemMatch: { _id: receiver._id } },
                ],
            },
        });

        if (existingConversation) {
            return resp.status(200).json({success: false,message: 'Request Already Shared Waiting for Accept !',conversation: existingConversation,});
        }

        // Create a new conversation
        const newconversation = new ConversationSchema({
            members: [
                { _id: sender._id, fullName: sender?.fullName, basicInfo: sender.basicInfo, role: sender.role },
                { _id: receiver._id, fullName: receiver?.fullName, basicInfo: receiver.basicInfo, role: receiver.role }
            ],
        });

        await newconversation.save();
        resp.status(201).json({ success: true, message: 'Requested', conversation: newconversation });
    } catch (err) {
        console.error("Error creating conversation:", err);
        resp.status(500).json({ success: false, error: err.message });
    }
};

// controller for get the connection request coming from trainer

const getEmployerConnectionsRequest = async (req, resp) => {
    // employer user id should be the payload id has sender id
    // const { senderId } = req.params
    const senderId = req.user?._id
 
    try {
        const findconversationRequest = await ConversationSchema.find({
            members: { $elemMatch: { _id: senderId } },
            requestStatus: "pending" // Filter by request status being "accepted"
        })
        // console.log(findconversationRequest)
        if (findconversationRequest?.length > 0) {
            const conversation = findconversationRequest?.filter(item => item?.members[0]?._id != senderId && item?.members[0]?.role === 'trainer')
            if (conversation?.length > 0) {
                resp.status(201).json({ success: true, message: 'Connection Found !', conversation });
            }
            else {
                resp.status(200).json({ success: false, message: "No Connection Request Found!" })
            }
        }
        else {
            resp.status(200).json({ success: false, message: 'No Connection Found' })
        }
    }
    catch (error) {
        console.log('error', error)
        resp.status(200).json({ success: false, message: 'Internal Server Error' })
    }

}



// controller for get the connection request coming from employer
const getTrainerConnectionsRequest = async (req, resp) => {
    //  trainer user id should be the payload id has sender id
    // const { senderId } = req.params
    const senderId = req.user?._id
    console.log('apit hit')

    try {
        const findconversationRequest = await ConversationSchema.find({
            members: { $elemMatch: { _id: senderId } },
            requestStatus: "pending" // Filter by request status being "accepted"
        })
        if (findconversationRequest?.length > 0) {
            const conversation = findconversationRequest?.filter(item => item?.members[0]?._id != senderId && item?.members[0]?.role === 'employer')
            if (conversation?.length > 0) {
                resp.status(201).json({ success: true, message: 'Connection Request Found !', conversation });
            }
            else {
                resp.status(200).json({ success: false, message: "No Connection Request Found!" })
            }
        }
        else {
            resp.status(200).json({ success: false, message: 'No Connection Found' })
        }
    }
    catch (error) {
        console.log('error', error)
        resp.status(200).json({ success: false, message: 'Internal Server Error' })
    }

}


//get all coversation 

const getAllConversation = async (req, resp) => {
    const allConversation = await ConversationSchema.find({ requestStatus: 'pending' })
    console.log(allConversation)
    try {
        resp.status(201).json({ success: true, message: 'All Conversation', allConversation })
    }
    catch {
        resp.status(200).json({ message: 'sever error' })
    }
}

//get conversation by userId


const getConversation = async (req, resp) => {
    const { userId } = req.params;
    // console.log(`Searching for conversations where user ID ${userId} is in the members array...`);
    if (userId?.length > 0) {
       
        try {

            const conversation = await ConversationSchema.find({
                members: { $elemMatch: { _id: userId } },
                requestStatus: "accepted" // Filter by request status being "accepted"
            })
            if (conversation?.length > 0) {
                const unreadChatsCount = await ConversationSchema.countDocuments({
                    members: { $elemMatch: { _id: userId } },
                    requestStatus: "accepted",
                    'lastMessage.isRead': false,
                    'lastMessage.sender': { $ne: userId }
                });
                resp.status(201).json({ sucess: true, conversation, unreadChatsCount });
            }
            else {
                resp.status(200).json({ success: false, message: 'No matched result or Waiting For Accept' })
            }
        } catch (err) {
            // console.error(`Error getting conversation by user ID ${userId}:`, err);
            resp.status(200).json({ success: false, message: `Server Error : ${err}` });
        }
    }
    else {
        resp.status(200).json({ success: false, message: 'User Id not provided' })
    }

};


// for trainer portal 
const getAllRequested = async (req, resp) => {
    const senderId = req.user?._id
    console.log('senderid', senderId)
    console.log('apit hit')

    try {
        const findconversationRequest = await ConversationSchema.find({
            members: { $elemMatch: { _id: senderId } },
            requestStatus: "pending" // Filter by request status being "accepted"
        })
        // console.log(findconversationRequest)
        if (findconversationRequest?.length > 0) {
            const conversation = findconversationRequest?.filter(item => item?.members[1]?._id != senderId )
            console.log('converation',findconversationRequest[0]?.members[1]?._id != senderId )
            if (conversation?.length > 0) {
                resp.status(201).json({ success: true, message: 'Connection Request Found !', conversation });
            }
            else {
                resp.status(200).json({ success: false, message: "No Connection Request Found!" })
            }
        }
        else {
            resp.status(200).json({ success: false, message: 'No Connection Found' })
        }
    }
    catch (error) {
        console.log('error', error)
        resp.status(200).json({ success: false, message: 'Internal Server Error' })
    }

};


// Accept the converstaion request  from employer portal

const employerConversationRequestAccept = async (req, resp) => {
    const { requestId } = req.body;
    const { _id } = req.user
    console.log('api hit')
    console.log(requestId)
    // Find the specific request from the array of requests in db and update it to accepted status

    try {

        const findconversation = await ConversationSchema.findOneAndUpdate(
            {
                members: { $elemMatch: { _id: requestId, _id } },
                requestStatus: "pending",
            },
            {
                $set: {
                    'requestStatus': 'accepted',
                }
            },
            { new: true },
        )
        // console.log(findconversation);
        if (findconversation) {

            await findconversation.save()
            // console.log(findconversation);
            const conversation = await ConversationSchema.find({
                members: { $elemMatch: { _id } },
                requestStatus: "pending" // Filter by request status being "pending"
            })
            resp.status(201).json({ success: true, message: 'Conversation Request is Accepted', conversation })
        }
        else {
            resp.status(200).json({ success: false, message: 'Error in Converstaion Accept' })
        }


    }
    catch (error) {
        // console.log(error)
        console.log("Error in finding and updating the document")
        resp.status(200).json({ success: false, message: 'Server Error', error });

    }
}

// accept the converation request from trainer portal
const trainerConversationRequestAccept = async (req, resp) => {
    const { requestId } = req.body;
    const { _id } = req.user
    console.log('api hit')
    console.log(requestId)
    // Find the specific request from the array of requests in db and update it to accepted status

    try {

        const findconversation = await ConversationSchema.findOneAndUpdate(
            {
                members: { $elemMatch: { _id: requestId, _id } },
                requestStatus: "pending",
            },
            {
                $set: {
                    'requestStatus': 'accepted',
                }
            },
            { new: true },
        )
        // console.log(findconversation);
        if (findconversation) {

            await findconversation.save()
            // console.log(findconversation);
            const conversation = await ConversationSchema.find({
                members: { $elemMatch: { _id } },
                requestStatus: "pending" // Filter by request status being "pending"
            })
            resp.status(201).json({ success: true, message: 'Conversation Request is Accepted', conversation })
        }
        else {
            resp.status(200).json({ success: false, message: 'Error in Converstaion Accept' })
        }


    }
    catch (error) {
        // console.log(error)
        console.log("Error in finding and updating the document")
        resp.status(200).json({ success: false, message: 'Server Error', error });

    }
}

const employerdeclineConversation = async (req, resp) => {
    const { id } = req.body;
    const { _id } = req.user
    console.log('apit delcine hit')
    try {
        const declineConversation = await ConversationSchema.findOneAndUpdate(
            {
                members: { $elemMatch: { _id: id, _id } },
                requestStatus: "pending",
            },
            {
                $set: {
                    'requestStatus': 'decline',
                }
            },
            { new: true },


        )
        console.log(declineConversation);

        if (declineConversation && req.user) {
            const findconversation = await ConversationSchema.find({
                members: { $elemMatch: { _id } },
                requestStatus: "pending" // Filter by request status being "pending"
            })
            const conversation = findconversation?.filter(item => item?.members[0]?._id != senderId && item?.members[0]?.role === 'trainer')
            if (conversation) {
                resp.status(201).json({ success: true, message: 'Conversation Request is Declined', conversation })
            }

        }
        else {
            resp.status(200).json({ success: false, message: 'No Pending Request Found!' })
        }
    }
    catch (error) {
        resp.status(200).json({ success: false, message: 'Server Error', error })
    }

}

const trainerdeclineConversation = async (req, resp) => {
    const { id } = req.body;
    const { _id } = req.user
    console.log('apit delcine hit')
    try {
        const declineConversation = await ConversationSchema.findOneAndUpdate(
            {
                members: { $elemMatch: { _id: id, _id } },
                requestStatus: "pending",
            },
            {
                $set: {
                    'requestStatus': 'decline',
                }
            },
            { new: true },


        )
        console.log(declineConversation);

        if (declineConversation && req.user) {
            const findconversation = await ConversationSchema.find({
                members: { $elemMatch: { _id } },
                requestStatus: "pending" // Filter by request status being "pending"
            })
            const conversation = findconversation?.filter(item => item?.members[0]?._id != senderId && item?.members[0]?.role === 'employer')
            if (conversation) {
                resp.status(201).json({ success: true, message: 'Conversation Request is Declined', conversation })
            }

        }
        else {
            resp.status(200).json({ success: false, message: 'No Pending Request Found!' })
        }
    }
    catch (error) {
        resp.status(200).json({ success: false, message: 'Server Error', error })
    }

}

const employerRemoveConversation = async (req, resp) => {
    const { id } = req.params;
    const { _id } = req.user
    console.log('apit remove hit')
    try {
        const removeConversation =await ConversationSchema.findOneAndDelete(
           {
            _id: id,
            members: { $elemMatch: { _id: _id} }, // Corrected filter condition
            requestStatus: "accepted",
           }
        )
        if (removeConversation && req.user) {
            const findconversation = await ConversationSchema.find({
                members: { $elemMatch: { _id } },
                requestStatus: "pending" // Filter by request status being "pending"
            })
            const conversation = findconversation?.filter(item => item?.members[0]?._id != senderId && item?.members[0]?.role === 'trainer')
            if (conversation) {
                resp.status(201).json({ success: true, message: 'Conversation Removed ', conversation })
            }

        }
        else {
            resp.status(200).json({ success: false, message: 'No conversation  Found!' })
        }
    }
    catch (error) {
        resp.status(200).json({ success: false, message: 'Server Error', error })
    }

}

const trainerRemoverConversation = async (req, resp) => {
    const { id } = req.params;
    const { _id } = req.user
    console.log('apit remove hit')
    try {
        const removeConversation = await ConversationSchema.findOneAndDelete({
            _id: id,
            members: { $elemMatch: { _id: _id} }, // Corrected filter condition
            requestStatus: "accepted",
        });
        console.log('removeConveration',removeConversation)
        if (removeConversation && req.user) {
            const findconversation = await ConversationSchema.find({
                members: { $elemMatch: { _id } },
                requestStatus: "pending" // Filter by request status being "pending"
            })
            const conversation = findconversation?.filter(item => item?.members[0]?._id != senderId && item?.members[0]?.role === 'employer')
            if (conversation) {
                resp.status(201).json({ success: true, message: 'Conversation Removed', conversation })
            }

        }
        else {
            resp.status(200).json({ success: false, message: 'No Pending Request Found!' })
        }
    }
    catch (error) {
        resp.status(200).json({ success: false, message: 'Server Error', error })
    }

}


// Update last message in a conversation
const markMessageAsRead = async (req, resp) => {
    const { conversationId } = req.params;

    try {
        // Find the conversation by its ID
        let conversation = await ConversationSchema.findById(conversationId);

        if (!conversation) {
            return resp.status(404).json({ success: false, message: "Conversation not found" });
        }

        // Update the isRead status of the lastMessage
        if (conversation.lastMessage && !conversation.lastMessage.isRead) {
            conversation.lastMessage.isRead = true;
            await conversation.save();
        }
        resp.status(200).json({ success: true, message: "Message marked as read", conversation });
    } catch (err) {
        console.error(`Error updating isRead status for conversation ID ${conversationId}:`, err);
        resp.status(500).json({ success: false, error: err.message });
    }
};
const updateLastMessage = async (req, resp) => {
    const { conversationId } = req.params;
    const { lastMessage } = req.body;
    // console.log(req.body)
    // console.log(req.params)

    try {
        // Find the conversation by its ID
        let updatedConversation = await ConversationSchema.findById(conversationId);

        if (!updatedConversation) {
            return resp.status(404).json({ success: false, message: "Conversation not found" });
        }

        // Update the last message in the conversation
        updatedConversation.lastMessage = lastMessage;

        // Save the updated conversation
        await updatedConversation.save();

        resp.status(200).json({ success: true, updatedConversation});
    } catch (err) {
        // console.error(`Error updating last message for conversation ID ${conversationId}:`, err);
        resp.status(500).json({ success: false, error: err.message });
    }
};

const getLastMessage = async (req, resp) => {
    const { conversationId } = req.params
    const lastMessage = await ConversationSchema.findById(conversationId, "lastMessage").lean()
    // console.log(lastMessage)
    const unreadCount = await MessageSchema.countDocuments({
        conversationId: conversationId,
        isRead: false,
      });
    if (lastMessage) {
        resp.status(201).json({ success: true, message: 'Get Last Message Success', lastMessage, unreadCount: unreadCount})
    }
    else {
        resp.status(200).json({ success: false, message: "No Last Message" })
    }
}




module.exports = {
    newConversation, getConversation,
    getAllConversation, updateLastMessage,
    getLastMessage, trainerConversationRequestAccept,
    employerConversationRequestAccept, employerdeclineConversation,
    trainerdeclineConversation, getAllRequested,
    getEmployerConnectionsRequest, getTrainerConnectionsRequest,
    employerRemoveConversation,trainerRemoverConversation, markMessageAsRead
}
 