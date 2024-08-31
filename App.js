const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dbConnect = require('./config/dbconnect');
const cookieParser = require('cookie-parser');
const os = require('os');
const dotenv = require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const sessionRoutes = require('./route/sessionsRoute');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "*",
    credentials: true
}));

// Database connection
dbConnect();

// Routes imports
const { notFound, errorHandler } = require('./middleware/errorhandler');
const userauth = require('./route/useroute');
const message = require('./route/messageroute');
const conversation = require('./route/conversationroute');
const trainer = require('./route/trainerroute');
const employer = require('./route/employerroute');
const postRequirement = require('./route/employerpostrequirementroute');
const trainerPost = require('./route/trainercreatepostroute');

const employerPost =require('./route/employercreatepostroute');
const feedpost=require('./route/feedroute')


const admin = require('./route/adminroute');
const student = require('./route/studentroute');

// Register routes
app.use("/trainer", trainer);
app.use("/employer", employer);
app.use('/employerpost', postRequirement);
app.use('/trainerpost', trainerPost);
app.use('/employerpost', employerPost); // all employer create post
app.use("/user", userauth);
app.use("/message", message);
app.use("/conversation", conversation);
app.use('/feedpost',feedpost)
app.use('/admin', admin);
app.use('/student', student);

// Function to get local IP address
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();

    for (const interfaceName of Object.keys(interfaces)) {
        const networkInterface = interfaces[interfaceName];

        for (const iface of networkInterface) {
            if (!iface.internal && iface.family === 'IPv4') {
                return iface.address;
            }
        }
    }

    return 'localhost'; // Default to localhost if no suitable address is found
}

const localIp = getLocalIpAddress();
console.log(localIp, "Test");

// Endpoint to retrieve local IP address
app.get("/localip", (req, res) => {
    try {
        res.json({ message: 'localIpfected', localIp: localIp });
    } catch (error) {
        res.json({ message: 'error in ip' });
    }
});

// Simple test endpoint
app.get("/server", (req, res) => {
    res.send("<h1>Working From Server</h1>");
});
app.use('/sessions', sessionRoutes);

// Start Express server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`);
});

// Create separate server for Socket.io
const ioServer = http.createServer();
const io = socketIo(ioServer, {
    cors: {
        origin: '*',
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }
});

let users = [];

// Socket.io event handlers
const addUser = (userId, socketId) => {
    let user = users.find(user => user.userId === userId);

    if (user) {
        user.socketId = socketId;
    } else {
        users.push({ userId, socketId });
        console.log("User joined:", userId);
    }
};

const removeUser = (socketId) => {
    const index = users.findIndex((user) => user.socketId === socketId);
    if (index !== -1) {
        const removedUser = users.splice(index, 1)[0];
        console.log("User left:", removedUser.userId);
    }
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        if (user && user.socketId) {
            io.to(user.socketId).emit("getMessage", { senderId, text });
            console.log(`Message: "${text}" sent to ${user.userId} from ${senderId}`);

            io.to(socket.id).emit("updateLastMessage", {
                conversationId: receiverId,
                lastMessage: { sender: senderId, text, createdAt: Date.now() },
            });
            console.log(`Last message updated for sender: ${senderId} ${text}`);
        } else {
            console.log(`User not found or socket ID not available for ${receiverId}`);
        }
    });

    socket.on("sendTyping", ({ conversationId, senderId, receiverId }) => {
        const user = getUser(receiverId);
        if (user && user.socketId) {
            io.to(user.socketId).emit("typing", { conversationId, senderId });
        }
    });

    socket.on("stopTyping", ({ conversationId, senderId, receiverId }) => {
        const user = getUser(receiverId);
        if (user && user.socketId) {
            io.to(user.socketId).emit("stopTyping", { conversationId, senderId });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});

// Start Socket.io server on a different port (4040)
const SOCKET_PORT = process.env.SOCKET_PORT || 4040;
ioServer.listen(SOCKET_PORT, () => {
    console.log(`Socket.io server is running on port ${SOCKET_PORT}`);
});

module.exports = { io };
