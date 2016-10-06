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

