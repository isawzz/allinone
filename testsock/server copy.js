const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(__dirname + '/public'));

// Handle Socket.IO connections
io.on('connection', (socket) => {
	console.log('A user connected');

	socket.on('chat message', (msg) => {
		console.log('message: ' + msg);
		io.emit('chat message', msg);
	});

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

// Start server
server.listen(3000, () => {
	console.log('Listening on *:3000');
});
