const { Server } = require('socket.io');
const Message = require('../models/Message');
const Match = require('../models/Match');

let io;

const initializeSockets = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Customize this for production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific match room
    socket.on('joinRoom', async ({ matchId, userId }) => {
      // Basic validation that user is part of the match
      try {
        const match = await Match.findById(matchId);
        if (match && (match.user1.toString() === userId || match.user2.toString() === userId)) {
          socket.join(matchId);
          console.log(`User ${userId} joined room: ${matchId}`);
        } else {
          socket.emit('error', { message: 'Unauthorized to join this room' });
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Handle new message
    socket.on('sendMessage', async ({ matchId, senderId, content }) => {
      try {
        const message = await Message.create({
          matchId,
          senderId,
          content
        });

        // Broadcast to everyone in the room (including sender, or use socket.to().emit)
        io.to(matchId).emit('receiveMessage', message);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ matchId, senderId, isTyping }) => {
      socket.to(matchId).emit('typingStatus', { senderId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};

module.exports = {
  initializeSockets,
  getIo
};
