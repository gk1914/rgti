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
var bombList = [];
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
var fireCooldown = 1500;
var bulletLifetime = 1000;
var xBulletPosition;
var zBulletPosition;
var bulletRot;
var bulletSpeed = 0.3;
var bullet;
//
// Moving bombs
var bombSpeed = 0.005;
var bombSize;
var bombResponseText;

var lastSpawn = 0;
var spawnInterval = 5000;
var bombSpawnPoints = [
	[10,0,0],
	[-10,0,0],
	[5,0,-10],
	[-5,0,-10]];
var bombMoveProgram = [
	[[8,0], [6, 0], [14, 0], [2, 0]],
	[[-8,0], [-6, 0], [-14, 0], [-2, 0]],
	[[4, -8], [3, -6], [12, -4], [1, -2]],
	[[-4, -8], [-3, -6], [-12, -4], [-1, -2]]];



//
// Matrix utility functions
//
// mvPush   ... push current matrix on matrix stack
// mvPop    ... pop top matrix from stack
// degToRad ... convert degrees to radians
//
function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

//
// initGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initGL(canvas) {
  var gl = null;
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch(e) {}

  // If we don't have a GL context, give up now
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
  return gl;
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);

  // Didn't find an element with the specified ID; abort.
  if (!shaderScript) {
    return null;
  }
  
  // Walk through the source element's children, building the
  // shader source string.
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) {
        shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
  
  // Now figure out what type of shader script we have,
  // based on its MIME type.
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }

  // Send the source to the shader object
  gl.shaderSource(shader, shaderSource);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
  
  // Create the shader program
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
  
  // start using shading program for rendering
  gl.useProgram(shaderProgram);
  
  // store location of aVertexPosition variable defined in shader
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

  // turn on vertex position attribute at specified position
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  // store location of aVertexNormal variable defined in shader
  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");

  // store location of aTextureCoord variable defined in shader
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  // store location of uPMatrix variable defined in shader - projection matrix 
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  // store location of uMVMatrix variable defined in shader - model-view matrix 
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  // store location of uSampler variable defined in shader
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

//
// setMatrixUniforms
//
// Set the uniforms in shaders.
//
function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//
// initTextures
//
// Initialize the textures we'll be using, then initiate a load of
// the texture images. The handleTextureLoaded() callback will finish
// the job; it gets called each time a texture finishes loading.
//

//
// handleLoadedWorld
//
// Initialisation of world 
//
function handleLoadedWorld(data) {
  var lines = data.split("\n");
  var vertexCount = 0;
  var vertexPositions = [];
  var vertexTextureCoords = [];
  for (var i in lines) {
    var vals = lines[i].replace(/^\s+/, "").split(/\s+/);
    if (vals.length == 5 && vals[0] != "//") {
      // It is a line describing a vertex; get X, Y and Z first
      vertexPositions.push(parseFloat(vals[0]));
      vertexPositions.push(parseFloat(vals[1]));
      vertexPositions.push(parseFloat(vals[2]));

      // And then the texture coords
      vertexTextureCoords.push(parseFloat(vals[3]));
      vertexTextureCoords.push(parseFloat(vals[4]));

      vertexCount += 1;
    }
  }

  worldVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
  worldVertexPositionBuffer.itemSize = 3;
  worldVertexPositionBuffer.numItems = vertexCount;

  worldVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
  worldVertexTextureCoordBuffer.itemSize = 2;
  worldVertexTextureCoordBuffer.numItems = vertexCount;

  document.getElementById("loadingtext").textContent = "";
}





//
// 
// LOAD OBJ FILES
//
//

// Get X,Y,Z scale of OBJ model (for collision detection)
function getOBJSize(mesh){
  var x = [];
  var y = [];
  var z = [];

  for (var i = 0; i < mesh.vertices.length ; i++) {
    if(i%3==0){
      x.push(mesh.vertices[i]);
    }else if(i%3==1){
      y.push(mesh.vertices[i]);      
    }else{
      z.push(mesh.vertices[i]);
    }
  }
  var maxX = Math.max.apply(Math,x);
  var minX = Math.min.apply(Math,x);

  var maxY = Math.max.apply(Math,y);
  var minY = Math.min.apply(Math,y);

  var maxZ = Math.max.apply(Math,z);
  var minZ = Math.min.apply(Math,z);
  
  return [Math.abs(maxX) + Math.abs(minX), Math.abs(maxY) + Math.abs(minY), Math.abs(maxZ) + Math.abs(minZ)]
}

function importOBJ(data){
  var mesh = new OBJ.Mesh(data);
  OBJ.initMeshBuffers(gl, mesh);
  return mesh
}
function loadWorld() {
  var request = new XMLHttpRequest();
  request.open("GET", "./assets/world.txt");
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      handleLoadedWorld(request.responseText);
    }
  }
  request.send();
}

function loadSoldier() {
  var request = new XMLHttpRequest();
  request.open("GET", "./assets/soldier2.obj");
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      mesh = importOBJ(request.responseText);


    }
  }
  request.send();
}

function loadBomb() {
  var request = new XMLHttpRequest();
  request.open("GET", "./assets/bomb.obj");
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      bomb = importOBJ(request.responseText);
      bombSize = getOBJSize(bomb);
      //bombList.push(importOBJ(request.responseText));
	    //bombList.push(importOBJ(request.responseText));
	    bombResponseText = request.responseText;
    }
  }
  request.send();
}

function loadHouse() {
  var request = new XMLHttpRequest();
  request.open("GET", "./assets/farmhouse.obj");
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      house = importOBJ(request.responseText);
    }
  }
  request.send();
}

function loadAmmo() {
  var request = new XMLHttpRequest();
  request.open("GET", "./assets/dinamite.obj");
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      ammo = importOBJ(request.responseText);
    }
  }
  request.send();
}

function loadBullet() {
  var request = new XMLHttpRequest();
  request.open("GET", "./assets/Bullet.obj");
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      bulletMesh = importOBJ(request.responseText);
    }
  }
  request.send();
}


//
// 
//
// 
// LOAD TEXTURES
//
//
function initTextures() {
  wallTexture = gl.createTexture();
  wallTexture.image = new Image();
  wallTexture.image.onload = function () {
    handleTextureLoaded(wallTexture)
  }
  wallTexture.image.src = "./assets/wall.png";

  midTexture = gl.createTexture();
  midTexture.image = new Image();
  midTexture.image.onload = function () {
    handleTextureLoaded(midTexture)
  }
  midTexture.image.src = "./assets/textureJPG.jpg";

  bombTexture = gl.createTexture();
  bombTexture.image = new Image();
  bombTexture.image.onload = function () {
    handleTextureLoaded(bombTexture)
  }
  bombTexture.image.src = "./assets/bombtext.png";

  houseTexture = gl.createTexture();
  houseTexture.image = new Image();
  houseTexture.image.onload = function () {
    handleTextureLoaded(houseTexture)
  }
  houseTexture.image.src = "./assets/farmhouseT.jpg";
  
  ammoTexture = gl.createTexture();
  ammoTexture.image = new Image();
  ammoTexture.image.onload = function () {
    handleTextureLoaded(ammoTexture)
  }
  ammoTexture.image.src = "./assets/D.png";

  bulletTexture = gl.createTexture();
  bulletTexture.image = new Image();
  bulletTexture.image.onload = function () {
    handleTextureLoaded(bulletTexture)
  }
  bulletTexture.image.src = "./assets/Bullet_Texture.jpg";

}




function handleTextureLoaded(texture) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // Third texture usus Linear interpolation approximation with nearest Mipmap selection
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.bindTexture(gl.TEXTURE_2D, null);

  // when texture loading is finished we can draw scene.
  texturesLoaded = true;
}

//
// 

//
// drawScene
//
// Draw the scene.
//
function drawScene() {
  // set the rendering environment to full canvas size
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // If buffers are empty we stop loading the application.
  if (worldVertexTextureCoordBuffer == null || worldVertexPositionBuffer == null) {
    return;
  }
  
  // Establish the perspective with which we want to view the
  // scene. Our field of view is 45 degrees, with a width/height
  // ratio of 640:480, and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  mat4.identity(mvMatrix);

  // Now move the drawing position a bit to where we want to start
  // drawing the world.



  mat4.rotate(mvMatrix, degToRad(45), [1, 0, 0]);
  if(isCollision){
    mat4.translate(mvMatrix, [-bodysMY[0].position[0], -20, -bodysMY[0].position[2]-15]);
  }else{
    mat4.translate(mvMatrix, [-xPosition, -20, -zPosition-15]);
  }
  mvPushMatrix();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, wallTexture);
  
  gl.uniform1i(shaderProgram.samplerUniform, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, worldVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  
  gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, worldVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);


  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, worldVertexPositionBuffer.numItems);
 
  // ^^^^^^^
  //  WORLD
  



  for (var i = 0; i < meshes.length; i++) {
    // restore last location
    mvPopMatrix();

    // store current location
    mvPushMatrix();

    if (i==0) {
      //soldier

      //mat4.translate(mvMatrix, meshes[i].position);
      mat4.translate(mvMatrix, [bodysMY[i].position[0], bodysMY[i].position[1], bodysMY[i].position[2]-1.5]);
      mat4.rotate(mvMatrix, degToRad(rotMouse), [0, -1, 0]);
      drawOBJ(mesh,midTexture);

    }else if(i==1){
      //house

      mat4.translate(mvMatrix, meshes[i].position);
      drawOBJ(house,houseTexture);

    }else{
      //bomb
      mat4.translate(mvMatrix, meshes[i].position);
      drawOBJ(bomb,bombTexture);
    }
  }
  
  // draw bullet 
  if (fire) {
    //console.log("FIRE");
    mvPopMatrix();
    mvPushMatrix();
    mat4.translate(mvMatrix, [bulletMesh.xBulletPosition, 2.25, bulletMesh.zBulletPosition-1.5]);
    mat4.scale(mvMatrix, [0.2,0.2,0.2]);
    mat4.rotate(mvMatrix, degToRad(bulletMesh.bulletRot), [0, -1, 0]);

    drawOBJ(bulletMesh,bulletTexture);
  }
  
  // draw ammo
    //console.log("FIRE");
    mvPopMatrix();
    mvPushMatrix();
    mat4.translate(mvMatrix, [0, 0.0, 0]);

    drawOBJ(ammo,ammoTexture);

}


function drawOBJ(obj,texture){

  // Draw the world by binding the array buffer to the world's vertices
  // array, setting attributes, and pushing it to GL.
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Set the texture coordinates attribute for the vertices.
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.textureBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, obj.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Activate textures
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.uniform1i(shaderProgram.samplerUniform, 0);


  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
  setMatrixUniforms();

  gl.drawElements(gl.TRIANGLES, obj.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


//
// animate
//
// Called every time before redeawing the screen.
//
function animate() {
  
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;

    if (speedForward != 0) {
      zPosition -= speedForward * elapsed;
    }

    if (speedSide != 0) {
      xPosition -= speedSide * elapsed;
    }
    
    // bombs
    if (timeNow - lastSpawn > spawnInterval) {
	if (lastSpawn != 0) 
	  spawnBombs();
	  lastSpawn = timeNow;
    }
    updateBombDirection();
    animateBombs(elapsed);
	
	  // bullet
	  if (fire) {
		  var angle = degToRad(bulletMesh.bulletRot);
		  bulletMesh.xBulletPosition -= Math.sin(angle)*bulletSpeed;
		  bulletMesh.zBulletPosition -= Math.cos(angle)*(-bulletSpeed);
	  }
	  if (timeNow - lastFire > bulletLifetime)
	  {
	    fire = false;
	  }
  }
  
  //console.log(xPosition);
  lastTime = timeNow;
    

  updateOimoPhysics();

}

function animateBombs(elapsed) {
	for (var i = 0; i < bombList.length; i++) {
		bombList[i].position[0] += bombSpeed * elapsed * bombList[i].direction[0];
		bombList[i].position[2] += bombSpeed * elapsed * bombList[i].direction[1];
	}
}

//
// Function for spawning bombs and a helper function for randomizing spawn point
function spawnBombs() {
  spawnIndex = getSpawnIndex();
  bombList.push(importOBJ(bombResponseText));
  var tempIdx = bombList.length-1;
  bombList[tempIdx].position = bombSpawnPoints[spawnIndex].slice();
  bombList[tempIdx].rotation = [0,0,0];
  bombList[tempIdx].size = bombSize;
  bombList[tempIdx].program = bombMoveProgram[spawnIndex];
  bombList[tempIdx].currStep = 0;
  meshes[meshes.length] = bombList[tempIdx];
  bodysMY[bodysMY.length] = new OBJmodel(bombList[tempIdx].size, bombList[tempIdx].position, "bomb");
}

function getSpawnIndex() {
  return Math.floor(Math.random() * bombSpawnPoints.length);
}

// Destroy bomb at index i
function destroyBomb(i) {
  bombList.splice(i,1);
  meshes.splice(i+2,1);
}

// Update the direction of bombs (called every .... seconds)
function updateBombDirection() {
	for (var i = 2; i < meshes.length; i++) {
		//meshes[i].direction = moveBomb([meshes[i].position[0], meshes[i].position[2]], [0, 0]);
		var curr = meshes[i];
		meshes[i].direction = moveBomb([meshes[i].position[0], meshes[i].position[2]], curr.program[curr.currStep])
		
		var distToNextStep = distance([curr.position[0], curr.position[2]], curr.program[curr.currStep]);
		if (distToNextStep < 0.25)
			meshes[i].currStep++;
		if (meshes[i].currStep >= 4)
			destroyBomb(i-2);
	}
}
//Function for moving bomb from point a to point b
function moveBomb(p1, p2) {
	var x1 = p1[0];
	var x2 = p2[0];
	var y1 = p1[1];
	var y2 = p2[1];
	var dir = [(x2-x1), (y2-y1)];
	var dist = distance(p1, p2);
	var moveVector= [dir[0]/dist, dir[1]/dist];
	return moveVector;
}

// Helper: get distance between point p1 and p2
function distance(p1, p2) {
	var x1 = p1[0];
	var x2 = p2[0];
	var y1 = p1[1];
	var y2 = p2[1];
	return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}



//
// Keyboard handling helper functions
//
// handleKeyDown    ... called on keyDown event
// handleKeyUp      ... called on keyUp event
//
function handleKeyDown(event) {
  // storing the pressed state for individual key
  currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
  // reseting the pressed state for individual key
  currentlyPressedKeys[event.keyCode] = false;
}

//
// handleKeys
//
// Called every time before redeawing the screen for keyboard
// input handling. Function continuisly updates helper variables.
//
function handleKeys() {

  if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
    // Left cursor key or A
    speedSide = movingSpeed;
  } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
    // Right cursor key or D
    speedSide = -movingSpeed;
  } else {
    speedSide = 0;
  }

  if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
    // Up cursor key or W
    speedForward = movingSpeed;
  } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
    // Down cursor key
    speedForward = -movingSpeed;
  } else {
    speedForward = 0;
  }
  
  if (currentlyPressedKeys[32]) {
    // delete bomb that spawned first
    destroyBomb(0);
  }
}

// rotate soldier
function mouseRotation(x,y){
  xx = x - (gl.viewportWidth/2);
  yy = y - (gl.viewportHeight/2);
  rotMouse = angle(xx, yy, 0, 75);
}
//get angle
function angle(a1, a2, b1, b2) {
    
    theta = Math.atan2(b1 - a1, a2 - b2);
    if (theta < 0.0)
        theta += 2*Math.PI
    return theta/ Math.PI * 180;
}




function initPhy(){

  populate();
}

var meshes = [];
var meshesPositions = [];
var bodysMY = [];
var infos;

function populate() {
  //soldier
  mesh.position = [0,0,0];
  mesh.rotation = [0,0,0];
  mesh.size = getOBJSize(mesh);
  meshes[0] = mesh;

  bodysMY[0] = new OBJmodel(mesh.size, mesh.position, "soldier");

  //house
  house.position = [10,0,10];
  house.rotation = [0,0,0];
  house.size = getOBJSize(house); 
  meshes[1] = house;

  bodysMY[1] = new OBJmodel(house.size, house.position, "house");


  //addBomb();
}

function addBomb(){
  var ibomb = bomb
  ibomb.position = [0,0,-2];
  ibomb.rotation = [0,0,0];
  ibomb.size = getOBJSize(ibomb);
  meshes[meshes.length] = ibomb;
  bodysMY[bodysMY.length] = new OBJmodel(ibomb.size, ibomb.position, "bomb");
  console.log(meshes.length);
  
  /*bombList[0].position = [0,0,0];
  bombList[0].rotation = [0,0,0];
  bombList[0].size = getOBJSize(bombList[0]);
  meshes[meshes.length] = bombList[0];
  bodysMY[bodysMY.length] = new OBJmodel(bombList[0].size, bombList[0].position, "bomb");
  console.log(meshes.length);
  
  bombList[1].position = [10,0,0];
  bombList[1].rotation = [0,0,0];
  bombList[1].size = getOBJSize(bombList[1]);
  meshes[meshes.length] = bombList[1];
  bodysMY[bodysMY.length] = new OBJmodel(bombList[1].size, bombList[1].position, "bomb");
  console.log(meshes.length);*/

  return ibomb;
}


function updateOimoPhysics() {
        var collision, imesh, bodyMY, moveX, moveZ, i = bodysMY.length;
        while (i--){
            bodyMY = bodysMY[i];
            imesh = meshes[i];
            
            if (i == 0){
                  //console.log(zPosition);

              var io = new OBJmodel(bodysMY[0].size,bodysMY[0].position,"");
              io.setPosition([imesh.position[0]+xPosition,imesh.position[1],imesh.position[2]+zPosition]);
              collision = io.detectCollision(bodysMY[1]);
              if(typeof collision === 'string'){
                isCollision = true;
                console.log("insideee");
                if (collision == "top"){
                  bodysMY[0].setPosition([imesh.position[0]+xPosition,imesh.position[1],bodysMY[1].minZ-0.7]);
                  zPosition = bodysMY[1].minZ-0.7;                
                } else if (collision == "down"){
                  bodysMY[0].setPosition([imesh.position[0]+xPosition,imesh.position[1],bodysMY[1].maxZ+0.7]);
                  zPosition = bodysMY[1].maxZ+0.7;                
                }else if (collision == "left"){
                  bodysMY[0].setPosition([bodysMY[1].minX-0.5,imesh.position[1],imesh.position[2]+zPosition]);
                  xPosition = bodysMY[1].minX-0.5;                
                }else if (collision == "right"){
                  bodysMY[0].setPosition([bodysMY[1].maxX+0.5,imesh.position[1],imesh.position[2]+zPosition]);
                  xPosition = bodysMY[1].maxX+0.5;      
                }




              }else{
                //console.log(xPosition);

                isCollision = false;
                bodysMY[0].setPosition([imesh.position[0]+xPosition,imesh.position[1],imesh.position[2]+zPosition]);                
              }
            }else if(i == 1){
              //bodysMY[1] = bodyMY;

            }
        }
        drawScene();
    }







//
// start
//
// Called when the canvas is created to get the ball rolling.
// Figuratively, that is. There's nothing moving in this demo.
//
function start() {
  canvas = document.getElementById("glcanvas");
  infos = document.getElementById("info");
  //mouse movement listner
  canvas.addEventListener("mousemove", function(evt) {
      var xMouse = evt.offsetX || (evt.pageX - canvas.offsetLeft);
      var yMouse = evt.offsetY || (evt.pageY - canvas.offsetTop);
    mouseRotation(xMouse,yMouse);
      }, false
      );
  //mouse click listener
  canvas.addEventListener("mousedown", function(evt) {
    console.log("cscscsc");
	var currTime = new Date().getTime();
	if ((currTime - lastFire > fireCooldown || lastFire == 0) && ammoCount > 0) {
		lastFire = currTime;
		fire = true;
		ammoCount--;
		document.getElementById("ammo-count").innerHTML = ammoCount;
		bulletMesh.xBulletPosition = xPosition;
		bulletMesh.zBulletPosition = zPosition;
		bulletMesh.bulletRot = rotMouse;
	}	
      }, false
  );
  
    gl = initGL(canvas);      // Initialize the GL context

  // Only continue if WebGL is available and working
  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
    gl.clearDepth(1.0);                                     // Clear everything
    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things

    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.
    initShaders();
    
    // Next, load and set up the textures we'll be using.
    initTextures();
    // Initialise world objects
    loadWorld();
    loadSoldier();
    loadBomb();
    loadHouse();
  	loadAmmo();
    loadBullet();
  setTimeout(
    function() 
    {
    initPhy();

      //console.log(getOBJSize(mesh));
      // Bind keyboard handling functions to document handlers
      document.onkeydown = handleKeyDown;
      document.onkeyup = handleKeyUp;
      
      // Set up to draw the scene periodically.
      setInterval(function() {
        requestAnimationFrame(animate);
        handleKeys();
      }, 1000/60);
    }, 500);
  }
}
