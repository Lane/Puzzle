
// x - horizontal offset from the centre of the piece
// y - vertical offset from the centre of the piece

function Point(piece, x, y) {

	this.x = x;
	this.y = y;
	this.piece = piece;
	
	if(debug) {
		this.circle = new createjs.Shape();
		this.circle.graphics.beginFill("red").drawCircle(0, 0, 5);
		this.circle.x = this.x+piece.regX+piece.x;
		this.circle.y = this.y+piece.regY+piece.y;
		this.piece.parent.addChild(this.circle);
		this.piece.parent.parent._needsUpdate=true;
	}
	
	var _this = this;
	
	this.getStageOffset = function() {
	
		var rad2deg = 180/Math.PI;
		var deg2rad = 1/rad2deg;
		var rotation = this.getTotalRotation();
		var offset = { 
			x: (_this.x+_this.piece.x+_this.piece.parent.x),
			y: (_this.y+_this.piece.y+_this.piece.parent.y)
		};
		
		// a^2 + b^2 = c^2
		var radius = Math.floor(Math.sqrt((_this.x*_this.x)+(_this.y*_this.y)));
		var opposite = Math.floor(Math.sin(deg2rad*rotation)*radius);
		var adjacent = Math.floor(Math.cos(deg2rad*rotation)*radius);
		if(rotation == 0)
		{
			opposite = _this.x;
			adjacent = _this.y;
		}
		console.log(radius + ' - ' + opposite + ' - ' + adjacent); 
		var newOffset = {
			x: 0,
			y: 0
		};
		
		
		return offset;
	}
	
	this.getTotalRotation = function() {
		return (_this.piece.rotation + _this.piece.parent.rotation);
	}
	
	this.updatePoint = function() {
		if(typeof(this.circle) !== "undefined") {
		
			this.circle.x =this.x+piece.x;
			this.circle.y = this.y+piece.y;
		
			if(debug) {
				console.log("Updating point:");
				console.log(this);
			}	
		} 
	}
}

var pt = Point.prototype;

pt.toString = function() {
	var stageOffset = this.getStageOffset();
	var pointString = "Point: " + this.x + "," + this.y + " (" + stageOffset.x + "," + stageOffset.y + ")";
		
	return pointString;
}