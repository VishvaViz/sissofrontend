const route = require('express').Router()
const { addMesage,getMessage,getLastmessage, updateMessageStatus  } = require('../controllers/messagectrl')



route.post("/addMesage", addMesage)
route.get("/allMessage/:conversationId",getMessage)
route.get("/lastMessage/:conversationId",getLastmessage)
route.put('/updateMessageStatus/:messageId', updateMessageStatus);




module.exports = route
