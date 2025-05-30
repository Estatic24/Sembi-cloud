require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/error');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server })


app.use(cors({
  origin: process.env.CLIENT_URL || 'https://sembi-cloud-git-main-estatic24s-projects.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

connectDB();

app.use((req, res, next) => {
  next();
});

const Comment = require('./models/Comment')


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/playlists', require('./routes/playlistRoutes'));
app.use('/api/tracks', require('./routes/trackRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
require('./controllers/commentController')(wss, Comment)


app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
