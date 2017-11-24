function playShot(){
	if (gameActive) {
		var audio2 = new Audio("assets/fire.mp3"); // buffers automatically when created
		audio2.play();		
	}
}

function playAmmoPickup(){
	if (gameActive) {
		var audio2 = new Audio("assets/ammoPickup.mp3"); // buffers automatically when created
		audio2.play();
	}
}

function playEmptyPickup(){
	if (gameActive) {
		var audio2 = new Audio("assets/emptyAmmo.mp3"); // buffers automatically when created
		audio2.play();
	}
}

function playAmbientAudio(){
	if (gameActive) {
		var audio2 = new Audio("assets/ambientSound.mp3"); // buffers automatically when created
		audio2.loop = true;
		audio2.volume = 0.8;
		audio2.play();
	}
}

function playExplosion(){
	if (gameActive) {
		var audio2 = new Audio("assets/bomb.mp3"); // buffers automatically when created
		audio2.play();
	}
}

function playEndingSound(){
	var audio2 = new Audio("assets/gameover.mp3"); // buffers automatically when created
	audio2.volume = 0.8;
	audio2.play();
}

function playStartingSound(){
	var audio2 = new Audio("assets/letsdoit.mp3"); // buffers automatically when created
	audio2.play();
}
