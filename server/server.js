'use strict';

const express = require('express');
const { Server } = require('http');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const socketio = require('socket.io');

const app = express();
const server = Server(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/spacerace';
let username;

const User = mongoose.model('user', {
		username: String,
		increase: Number,
		gameid: String
})

const Game = mongoose.model('game', {
	winner: String,
	numofPlayers: Number
})


const startGameCountdown = (game) => {
  console.log('countdown started')
  setTimeout(startGame, 10000);
};

const startGame = (game) => {
  console.log('game started')
};

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}))

// app.get('/', (req, res) => res.render('home'));

app.get('/', (req, res) =>
  Game.find()
  .then(games => {
  	res.render('home', { games })
  })
)


io.on('connect', socket => {
  const id = socket.handshake.headers.referer.split('/').slice(-1)[0];

app.get('/game/:id', (req, res) => {
	User
		.find({gameid: req.params.id})
		.then(users => {
			console.log(users)
			res.render('game', {users: users})
		})
})


	app.post('/', (req, res) => {
	Game
			.create({numofPlayers: 1})
			.then((obj) => {
				User
					.create({username: req.body.username, increase: 2.5, gameid: obj._id})
					.then((obj) => {
						res.redirect(`/game/${obj.gameid}`)
					})
			})
			.catch(console.error)
	})


	app.post('/join', (req, res) => {
	User
		.create({ username: req.body.username, increase: 2.5, gameid: req.body.id})
		.then((obj) =>{
			res.redirect(`/game/${obj.gameid}`)
		})
	})
})

mongoose.Promise = Promise;

mongoose.connect(MONGODB_URL, () => {
  server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}...`);
  });
});
