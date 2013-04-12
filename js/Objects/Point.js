
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
		var offset = { 
			x: (_this.x+_this.piece.x+_this.piece.parent.x),
			y: (_this.y+_this.piece.y+_this.piece.parent.y)
		}
		
		return offset;
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