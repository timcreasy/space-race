'use strict';

const socket = io();
let player;

$(window).keyup(function (evt) {
		if (evt.which === 32) {
			player.increase = player.increase + .5
			socket.emit('player moved', {player: player});
		}
})

let updatePosition = (users) => {
	users.forEach((user) => {
		$("#" + user._id).css({'margin-bottom': `${user.increase}rem`})
	})
}

let updatePlayerList = (users) => {
	let playerList = "";
	let playerSidebar = "";
	$('#playerList').html();
	$('#playerSidebar').html();
	users.forEach((user) => {
		playerList += `<div id="${user._id}" class="ship">${user.username}</div>`;
		playerSidebar += `<h3>${user.username}</h3>`;
	});
	$('#playerList').html(playerList);
	$('#playerSidebar').html(playerSidebar);
	updatePosition(users);
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
socket.on('update player', ({player}) => {
	console.log(`${player.username} moved - ${player.increase}`);
});
socket.on('disconnect', () => console.log(`Socket disconnected`));
