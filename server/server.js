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

app.get('/', (req, res) => res.render('home'));

app.get('/game/create', (req, res, err) => {
    Game
      .create({player1: 'Alex', player2: 'Daniel'})
      .then(obj => res.redirect(`/game/${obj._id}`))
      .catch(err, () => console.log(err))
})

app.get('/game/:id', (req, res) => {
  res.render('game')
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
