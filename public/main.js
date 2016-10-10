'use strict';

const socket = io();
let player;

$(window).keyup(function (evt) {
		if (evt.which === 32) {
			player.increase = player.increase - .5
			socket.emit('player moved', {player: player});
		}
})

let updatePosition = (users) => {
	users.forEach((user) => {
		$("#" + user._id).css({'top': `${user.increase}rem`})
	})
}

let updatePlayerList = (users) => {
	let playerList = "";
	let spacing = 0
	$('#playerList').html();
	$('#playerSidebar').html();
	users.forEach((user) => {
		spacing = spacing + 50
		playerList += `<div id="${user._id}" class="ship">${user.username}</div>`;
		$(`#${user._id}`).css('left', `${spacing}px`);
		console.log(user)
	});
	$('#playerList').html(playerList);
	updatePosition(users);
}

let checkForWinners = (users) => {

	users.forEach((user) => {
		if (user.increase === -1) {
			return user;
		}
	})
	return false;
}


socket.on('connect', () => {
	const username = window.location.search.split('=').slice(-1)[0];;
	socket.emit('player joined', {username});
});
socket.on('player found', (data) => {
	console.log("PLAYER FOUND", data);
	player = data.player;
});
socket.on('update game', ({users}) => {
	updatePlayerList(users);
});
socket.on('player won', ({winner}) => {
	alert(`${winner.username} won the game!`);
});
socket.on('update player', ({player}) => {
	console.log(`${player.username} moved - ${player.increase}`);
});
socket.on('disconnect', () => console.log(`Socket disconnected`));
