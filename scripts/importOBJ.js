
function importOBJ(data){
  var mesh = new OBJ.Mesh(data);
  OBJ.initMeshBuffers(gl, mesh);
  loadedMeshes = loadedMeshes + 1;
  return mesh
}
function loadWorld() {
  var request = new XMLHttpRequest();
  request.open("GET", "./assets/world.txt");
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      handleLoadedWorld(request.responseText);
      loadedMeshes = loadedMeshes + 1;
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
  request.open("GET", "./assets/Bullet2.obj");
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      bulletMesh = importOBJ(request.responseText);
    }
  }
  request.send();
}

function loadRock1() {
  var request = new XMLHttpRequest();
  request.open("GET", "./assets/rock1.obj");
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      rockMesh = importOBJ(request.responseText);
	  rockResponseText = request.responseText;
	  rockSize = getOBJSize(rockMesh);

    }
  }
  request.send();
}

function loadObjects(){
    loadWorld();
    loadSoldier();
    loadBomb();
    loadHouse();
    loadAmmo();
    loadBullet();
    loadRock1();
}