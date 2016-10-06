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
				increase: Number
			}
		},
		{
			user : {
				username: String,
				increase: Number
			}
		},
		{
			user : {
				username: String,
				increase: Number
			}
		},
		{
			user: {
				username: String,
				increase: Number
			}
		}
	]
})

const hasTwoPlayers = (game) => {
  return game.player1 && game.player2
};

const startGameCountdown = (game) => {
  if (hasTwoPlayers) {
    setTimeout(startGame, 3000);
  };
};

const startGame = (game) => {
  console.log('game started')
};


app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}))

app.get('/', (req, res) => res.render('home'));

app.post('/', (req, res) => {
	Game
		.create({ users: { user: { username: req.body.username, increase: 2.5 }}})
		.then(obj => res.redirect(`/game/${obj._id}`))
		.catch(console.error)
})

app.get('/game/:id', (req, res) => {
	let playerId = req.params.id
	let userArr = []
	Game
		.find({ _id: playerId })
		.then(obj => {
			console.log(obj[0])
			res.render('game', obj[0])
		})
		.catch(console.error)
})

io.on('connect', socket => {
  const id = socket.handshake.headers.referer.split('/').slice(-1)[0];

  Game
    .findById(id)
    .then(game => {
      socket.gameId = game._id;
      socket.join(game._id);
      io.to(game._id).emit('player joined', game)
      return game
    })
    .then((game) => {
      startGameCountdown(game)
    })

  console.log(`Socket connectd: ${socket.id}`);
  socket.on('disconnect', () => console.log('socket disconnected'));
})

mongoose.Promise = Promise;

mongoose.connect(MONGODB_URL, () => {
  server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}...`);
  });
});
