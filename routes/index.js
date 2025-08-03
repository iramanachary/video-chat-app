const express = require('express');
const router = express.Router();
const { generateRoomID } = require('../utils');

const rooms = new Map();
let chatHistoryDB = new Map();

router.get('/', (req, res)=>{
   res.render('index');
});

router.get('/chat/:id', async (req, res)=>{
   try {
      const { id } = req.params;
      const username=rooms.get(id)?.username;
      res.render('chat', { id , username});
   } catch (error) {
      
   }

});

router.post('/create-room', async (req,res) => {
   try {
      // console.log(req.body);
      const { username } = req.body;
      const roomId=generateRoomID();
      const socketId=null;
      rooms.set(roomId, { username, socketId, joinedAt: Date.now()});

      res.json({roomId});
   } catch (error) {
      console.log(error);
      res.json({status:'error', error})
   }
});


router.get('/users/:id', (req, res) => {
   const { id } =req.params;
   const last10 = Array.from(rooms.entries())
       .slice(-10).filter(([roomID])=> id !==roomID)
       .map(([roomID, data]) => ({
           roomID,
           username: data.username
       }));

      //console.log(rooms);
   res.json(last10);
});

router.get('/chat-history/:fromID/:toID', (req, res) => {
   const { fromID, toID } = req.params;
   const chatKey = [fromID, toID].sort().join('-'); // Generate a unique key for the pair

   const history = chatHistoryDB.get(chatKey) || [];
   res.json({ messages: history });
});

module.exports = { router, rooms, chatHistoryDB};