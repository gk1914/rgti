

function OBJmodel(size, position, name) {
	this.size = size;
	this.position = position;
	this.name = name

	this.minX = (this.position[0]-(this.size[0]/2));
	this.maxX = (this.position[0]+(this.size[0]/2));

	this.minY = (this.position[1]-(this.size[1]/2));
	this.maxY = (this.position[1]+(this.size[1]/2));

	this.minZ = (this.position[2]-(this.size[2]/2));
	this.maxZ = (this.position[2]+(this.size[2]/2));

	this.detectCollision = function(b) {
		if ((this.minX <= b.maxX && this.maxX >= b.minX) &&
         (this.minY <= b.maxY && this.maxY >= b.minY) &&
         (this.minZ <= b.maxZ && this.maxZ >= b.minZ)){
			
			return this.getSide(b);
		}
		return;
    };



	this.getCollisionX = function(b) {

		if(this.maxX>b.maxX){

		}else{

		}
        return (this.position[0]+(this.size[2]/2));
    };

    this.setPosition = function(pos) {
		this.position = pos;

		this.minX = (this.position[0]-(this.size[0]/2));
		this.maxX = (this.position[0]+(this.size[0]/2));

		this.minY = (this.position[1]-(this.size[1]/2));
		this.maxY = (this.position[1]+(this.size[1]/2));

		this.minZ = (this.position[2]-(this.size[2]/2));
		this.maxZ = (this.position[2]+(this.size[2]/2));
    };
    this.getSide = function(b) {

		if(this.position[2] <= b.minZ){
			console.log("Top");
			return("top")
		}
		if(this.position[2] >= b.maxZ){
			console.log("Down");
			return("down")
		}
		if(this.position[0] < b.minX){
			console.log("Left");
			return("left");			
		}

		if(this.position[0] > b.maxX){
			console.log("Right");
			return("right");			
		}

    };





}
