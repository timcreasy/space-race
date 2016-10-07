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


const Game = mongoose.model('game', {
	users : [
		{
			user : {
				username: String,
				increase: Number,
				socketId: String
			}
		},
		{
			user : {
				username: String,
				increase: Number,
				socketId: String
			}
		},
		{
			user : {
				username: String,
				increase: Number,
				socketId: String
			}
		},
		{
			user: {
				username: String,
				increase: Number,
				socketId: String
			}
		}
	]
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
  .or([{ user: { $exists: false } }, { user: { $exists: false } }])
  .exists('result', false)
  .then(games => {
  	res.render('home', { games })
  })
)

// app.post('/', (req, res) => {
// 	Game
// 		.create({ users: { user: { username: req.body.username, increase: 2.5 }}})
// 		.then(obj => {
// 			res.redirect(`/game/${obj._id}`)
// 		})
// 		.catch(console.error)
// })

// app.post('/join', (req, res) => {
// 	console.log("my req", req.body)
// 	Game
// 		.findByIdAndUpdate(req.body.id, {$push: {"users": {user: {"username": req.body.username, "increase": 2.5}}}},  {new: true})
// 		.then(game => {
// 			res.redirect(`/game/${game._id}`)
// 		})
// })

// app.get('/game/:id', (req, res) => {
// 	let gameId = req.params.id
// 	if (req.query.user) {
// 		Game
// 			.findByIdAndUpdate(gameId, {$push: {"users": {user: {"username": req.query.user, "increase": 2.5}}}},  {new: true})
// 			.then(game => {
// 				res.render('game', game);
// 			})
// 			.catch(console.error);
// 	} else {
// 		Game
// 			.find({ _id: gameId })
// 			.then(game => {
// 				res.render('game', game[0])
// 			})
// 			.catch(console.error);
// 	}
// })

io.on('connect', socket => {
  const id = socket.handshake.headers.referer.split('/').slice(-1)[0];






app.get('/game/:id', (req, res) => {
	let gameId = req.params.id
	if (req.query.user) {
		Game
			.findByIdAndUpdate(gameId, {$push: {"users": {user: {"username": req.query.user, "increase": 2.5, "socketId": socket.id}}}},  {new: true})
			.then(game => {
				res.render('game', game);
			})
			.catch(console.error);
	} else {
		Game
			.find({ _id: gameId })
			.then(game => {
				res.render('game', game[0])
			})
			.catch(console.error);
	}
})











	app.post('/', (req, res) => {

	Game
			.create({ users: { user: { username: req.body.username, increase: 2.5, socketId: socket.id }}})
			.then(obj => {
				res.redirect(`/game/${obj._id}`)
			})
			.catch(console.error)
	})

	app.post('/join', (req, res) => {
		Game
			.findByIdAndUpdate(req.body.id, {$push: {"users": {user: {"username": req.body.username, "increase": 2.5, "socketId": socket.id}}}},  {new: true})
			.then(game => {
				console.log(socket.id);
				res.redirect(`/game/${game._id}`)
			})
	})

  Game
    .findById(id)
    .then(game => {
      socket.gameId = game._id;
      socket.join(game._id);
      io.to(game._id).emit('player joined', game)
    })

  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => console.log('socket disconnected'));
	socket.on('player moved', (s) => {
		// console.log(s);
		// console.log(s.id);
		// Game
		// 	.find({})

		console.log("PLAYER MOVED");
		console.log(s.msg);

		// Game.find({"user": {"socketId": s.msg}}, (err, abc) => {
		// 	console.log(abc);
		// })

		
		Game
			// .find({users: { "$in": ["user.socketId"]}})
			// .then((abc) => {
			// 	console.log(abc);
			// })
			.where("users.user.socketId").equals(s.msg)
			.then((abc) => {
				console.log(abc);
			})
	})
})

mongoose.Promise = Promise;

mongoose.connect(MONGODB_URL, () => {
  server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}...`);
  });
});
