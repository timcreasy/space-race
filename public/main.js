'use strict';

const socket = io();

let increase = 2.5;
$(window).keyup(function (evt) {
		if (evt.which === 32) {
			$(".ship").css({'margin-bottom': `${increase}rem`})
			increase = increase + .5
			socket.emit('player moved', {msg: socket.id});
			if (increase === 36.5) {
				console.log("You win")
			}
		}
})



socket.on('connect', () => console.dir(socket));
socket.on('disconnect', () => console.log(`Socket disconnected`));
socket.on('player joined', (game) => console.log(game))
