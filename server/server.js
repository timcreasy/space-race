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
// =======
// 	users : {
// 		user1 : {
// 			username: {type: String, default: ""},
// 			increase: Number
// 		},
// 		user2 : {
// 			username: {type: String, default: ""},
// 			increase: Number
// 		},
// 		user3 : {
// 			username: {type: String, default: ""},
// 			increase: Number
// 		},
// 		user4 : {
// 			username: {type: String, default: ""},
// 			increase: Number
// 		}
// 	},
//   numberOfUsers: {type: Number, default: 0}
// >>>>>>> aa01a14c0f9fb442477c64e353f09a7495ce9056
})

const addPlayerToGame = (game) => {
  if(game.users.length === 1) {
    Game
      .findByIdAndUpdate(game._id, {users: {$push: {"user": {"username": "Test2", "increase": 2.5}}},  {new: true})
      .then(g => startGameCountdown(g))
  } else if(game.users.length === 2) {
    Game
      .findByIdAndUpdate(game._id, {users: {$push: {"user": {"username": "Test3", "increase": 2.5}}}, () => {})
  } else if (game.users.length  === 3) {
    Game
      .findByIdAndUpdate(game._id, {users: {$push: {"user": {"username": "Test4", "increase": 2.5}}}, () => {})
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
