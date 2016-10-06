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
			username: {type: String, default: ""},
			increase: Number
		},
		user2 : {
			username: {type: String, default: ""},
			increase: Number
		},
		user3 : {
			username: {type: String, default: ""},
			increase: Number
		},
		user4 : {
			username: {type: String, default: ""},
			increase: Number
		}
	},
  numberOfUsers: {type: Number, default: 0}
})

const addPlayerToGame = (game) => {
  if (game.numberOfUsers === 0) {
    Game
      .findByIdAndUpdate(game._id, {$set: {"users.user1.username": "Alex", 'numberOfUsers': 1}}, () => {})
  }
  else if(game.numberOfUsers === 1) {
    Game
      .findByIdAndUpdate(game._id, {$set: {"users.user2.username": "Tom", 'numberOfUsers': 2}},  {new: true})
      .then(g => startGameCountdown(g))
  } else if(game.numberOfUsers === 2) {
    Game
      .findByIdAndUpdate(game._id, {$set: {"users.user3.username": "Mike", 'numberOfUsers': 3}}, () => {})
  } else if (game.numberOfUsers  === 3) {
    Game
      .findByIdAndUpdate(game._id, {$set: {"users.user4.username": "Ty", 'numberOfUsers': 4}}, () => {})
    }
}


const startGameCountdown = (game) => {
  console.log('countdown started')
  setTimeout(startGame, 10000);
};

const startGame = (game) => {
  console.log('game started')
};


app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/', (req, res) => res.render('home'));

app.get('/game/create', (req, res, err) => {
    Game
      .create({})
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
        game = addPlayerToGame(game);
        io.to(game._id).emit('player joined', game);
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