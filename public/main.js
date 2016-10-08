'use strict';

const socket = io();
let player;

$(window).keyup(function (evt) {
		if (evt.which === 32) {
			$(".ship").css({'margin-bottom': `${player.increase}rem`})
			player.increase = player.increase + .5
			socket.emit('player moved', {player: player});
			if (player.increase === 36.5) {
				console.log("You win")
			}
		}
})

socket.on('connect', () => {
	const username = window.location.search.split('=').slice(-1)[0];;
	socket.emit('player joined', {username});
});
socket.on('player found', (data) => {
	player = data.player;
});
socket.on('update player', ({player}) => {
	console.log(`${player.username} moved - ${player.increase}`);
});
socket.on('disconnect', () => console.log(`Socket disconnected`));
