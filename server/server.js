'use strict';

const express = require('express');
const { Server } = require('http');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const socketio = require('socket.io');
const session = require('express-session');

const app = express();
const server = Server(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/spacerace';
let username;

const User = mongoose.model('user', {
		username: String,
		increase: Number,
		gameid: String,
		socketId: String
})

const Game = mongoose.model('game', {
	winner: String,
	numofPlayers: Number
})

app.set('view engine', 'pug');
app.set(session({
	secret: "mysecretkey"
}));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}))

app.get('/', (req, res) =>
  Game
		.find()
		.then(games => {
			res.render('home', { games })
		})
)

app.post('/', (req, res) => {
	Game
		.create({numofPlayers: 1})
		.then((obj) => {
			User
				.create({username: req.body.username, increase: 2.5, gameid: obj._id})
				.then((obj) => {
					res.redirect(`/game/${obj.gameid}?username=${obj.username}`)
				})
		})
		.catch(console.error)
})

app.post('/join', (req, res) => {
	User
		.create({ username: req.body.username, increase: 2.5, gameid: req.body.id})
		.then((obj) =>{
			res.redirect(`/game/${obj.gameid}?username=${obj.username}`)
		})
})

app.get('/game/:id', (req, res) => {
	User
		.findOneAndUpdate({username: req.query.username})
		.then(() => {
				User
					.find({gameid: req.params.id})
					.then(users => {
						res.render('game', {users: users})
					})
		})
})

io.on('connect', socket => {
  const id = socket.handshake.headers.referer.split('/').slice(-1)[0].split('?')[0];

	socket.on('player joined', (player) => {
		User
			.find({$and: [{gameid: id}, {username: player.username}]})
			.then((user) => {
				socket.emit('player found', {player: user[0]});
				User
					.find({gameid: id})
					.then(users => {
						io.emit('update game', {users: users})
					})
			})
	});

	socket.on('player moved', ({player}) => {
		User
			.findByIdAndUpdate(player._id, {$set:{increase: player.increase}}, {new: true})
			.then((user) => {
				io.emit('update player', {player: user});
				User
					.find({gameid: id})
					.then(users => {
						io.emit('update game', {users: users})
					})
			})
	})
})

mongoose.Promise = Promise;

mongoose.connect(MONGODB_URL, () => {
  server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}...`);
  });
});
