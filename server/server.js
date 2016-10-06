'use strict';

const express = require('express');
const { Server } = require('http');
const mongoose = require('mongoose');
const socketio = require('socket.io');

const app = express();
const server = Server(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/spacerace';

app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/', (req, res) => res.render('home'));
mongoose.Promise = Promise
mongoose.connect(MONGODB_URL, () => {
  server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}...`);
  });
});

const Game = mongoose.model('game', {
	users : {
		user1 : {
			username: String,
			increase: Number
		},
		user2 : {
			username: String,
			increase: Number
		},
		user3 : {
			username: String,
			increase: Number
		},
		user4 : {
			username: String,
			increase: Number
		}
	}
})
