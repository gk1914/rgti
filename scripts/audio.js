function playShot(){
	var audio2 = new Audio("assets/fire.mp3"); // buffers automatically when created
	audio2.play();
}

function playAmmoPickup(){
	var audio2 = new Audio("assets/ammoPickup.mp3"); // buffers automatically when created
	audio2.play();
}

function playEmptyPickup(){
	var audio2 = new Audio("assets/emptyAmmo.mp3"); // buffers automatically when created
	audio2.play();
}

function playAmbientAudio(){
	var audio2 = new Audio("assets/ambientSound.mp3"); // buffers automatically when created
	audio2.volume = 0.4;
	audio2.play();
}

function playExplosion(){
	var audio2 = new Audio("assets/bomb.mp3"); // buffers automatically when created
	audio2.play();
}
