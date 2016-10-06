'use strict';

let increase = 2.5;
$(window).keyup(function (evt) {
		if (evt.which === 32) {
			$(".ship").css({'margin-bottom': `${increase}rem`})
			increase = increase + .5
			if (increase === 36.5) {
				console.log("You win")
			}
		}

})

const socket = io();

socket.on('connect', () => console.dir(socket));
socket.on('disconnect', () => console.log(`Socket disconnected`));
socket.on('player joined', (game) => console.log(game))
