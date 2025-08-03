const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const { router, rooms, chatHistoryDB } = require('./routes/index');
const server = http.createServer(app);

const io = socketIo(server, {
    cors : {
        origin : '*',
        methods : ['GET', 'POST']
    }
})


io.on('connection', (socket)=>{
    // console.log('Socket connected :', socket.id);
    socket.on('joinRoom', (roomID) => {
        const userData = rooms.get(roomID);
        if (userData) {
            userData.socketId = socket.id;
            rooms.set(roomID, userData);
            socket.join(roomID);
            // console.log(`${userData.username} joined room ${roomID}`);
        }
    });


    socket.on('sendPrivateMessage', ({fromID, toRoomID, message, userName }) => {
        const chatKey = [fromID, toRoomID].sort().join('-');  
        if (!chatHistoryDB.has(chatKey)) {
            chatHistoryDB.set(chatKey, []);
        }
        chatHistoryDB.get(chatKey).push({ fromID, message });
        const recipient = rooms.get(toRoomID);
        if (recipient && recipient.socketId) {
            io.to(recipient.socketId).emit('receiveMessage', {
                fromID,
                from: socket.id,
                message,
                userName
            });
        }
    });

})

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

app.use('/', router);


server.listen(3000, ()=> console.log('server started on port 3000'));

