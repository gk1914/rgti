// Global variable definitionvar canvas;
var canvas;
var gl;
var shaderProgram;



// Buffers
var worldVertexPositionBuffer = null;
var worldVertexTextureCoordBuffer = null;
var mesh = null;
var bomb = null;
var house = null;
var ammo;
var bulletMesh;
var rockMesh;
var bombList = [];
var loadedMeshes = 0;
//set how many meshes needs to be loaded
var targetLoadedMeshes = 7;
var textureCounter = 0;
//set how many textures needs to be loaded
var targetLoadedTextures = 7;

// Model-view and projection matrix and model-view matrix stack
var mvMatrixStack = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

// Variables for storing textures
var wallTexture = null;
var midTexture = null;
var bombTexture = null;
var houseTexture = null;
var ammoTexture = null;
var bulletTexture = null;
var rockTexture = null;
// Variable that stores  loading state of textures.
var texturesLoaded = false;

// Keyboard handling helper variable for reading the status of keys
var currentlyPressedKeys = {};

// Variables for storing current position and speed
var yaw = 0;
var xPosition = 0;
var yPosition = 3;
var zPosition = 0;
var speedForward = 0;
var speedSide = 0;

//mouse position
var xMouse = 0;
var yMouse = 0;
var rotMouse = 0;
// Used to make us "jog" up and down as we move forward.
var joggingAngle = 0;
var movingSpeed = 0.008;

var spawnPosition = [1,0,0];

// Helper variable for animation
var lastTime = 0;


var isCollision = false;

//
// Firing
var fire=false;
var lastFire = 0;
var ammoCount = 5;
var fireCooldown = 1250;
var bulletLifetime = 1000;
var xBulletPosition;
var zBulletPosition;
var bulletRot;
var bulletSpeed = 0.3;
var bulletBody;
//
// Moving bombs
var bombSpeed = 0.005;
var bombSize;
var bombResponseText;

var lastSpawn = 0;
var spawnInterval = 2000;
var bombSpawnPoints = [
	[10,0,-23],
	[-20,0,-20],
	[0,0,-25],
	//[-15,0,-20],
	[-24,0,-4],
	[10,0,29]];
var bombMoveProgram = [
	[[18,-18], [24, -12], [16, -8], [24, -2], [10, 10]],				// zgoraj desno
	[[-10,-12], [-18, -8], [-14, 0], [-5, -3], [6, 10]],				// zgoraj levo
	[[5, -20], [-2, -15], [0, -9], [7, -5], [10, 10]],				// še bolj zgoraj desno
	//[[-4, -8], [-3, -6], [-12, -4], [10, 10]],
	[[-27, 5], [-17, 10], [-13, 8], [-10, 4], [10, 10]],				// skrajno levo				
	[[-5, 28], [-12, 22], [-16, 18], [-5, 15], [-7, 7], [10, 10]]];		// spodaj levo
	
//
// Ammo
var lastAmmoPickup = 0;
var ammoSpawnInterval = 3000;
var ammoActive = true;
var ammoSpawnPoints = [
	[20,0,-2],
	[-14,0,-10],
	[-18,0,18],
	[15,0,22]];
//
// Nature
var rocks;
var rockResponseText;
var rockSize;

//
// Game
var timer = 0;
var houseHP = 1000;
var playerHP = 100;
var bombsKilled = 0;
var bombsSpawned = 0;
var gameActive = true;
var totalScore = 0;

var endTime = 30000;


var meshes = [];
var meshesPositions = [];
var bodysMY = [];
var rocks = [];
var infos;
var rock;
