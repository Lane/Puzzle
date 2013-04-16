function PointMatch(pointOne, pointTwo) {

	this._point1 = pointOne;
	this._point2 = pointTwo;
	
	this._point1.piece.addPoint(this._point1);
	this._point1.piece.addPointMatch(this);
	this._point2.piece.addPoint(this._point2);
	this._point2.piece.addPointMatch(this);
	
	if(debug) {
		var circleColor = createjs.Graphics.getRGB(
			((Math.random()*255))|0, 
			((Math.random()*255))|0, 
			((Math.random()*255))|0
		);
		
		this._point1.circle.graphics.setStrokeStyle(1).beginStroke("red").beginFill(circleColor).drawCircle(0, 0, 5);
		this._point2.circle.graphics.setStrokeStyle(1).beginStroke("red").beginFill(circleColor).drawCircle(0, 0, 5);
	}
}

var pm = PointMatch.prototype;

pm.isMatched = function() {
	// get the net difference between the points
	var p1Offset = this._point1.getStageOffset();
	var p2Offset = this._point2.getStageOffset();
	xDiff = Math.abs(p1Offset.x - p2Offset.x);
	yDiff = Math.abs(p1Offset.y - p2Offset.y);
	
	rotationDiff = Math.abs((this._point1.getTotalRotation()%360) - (this._point2.getTotalRotation()%360));
	
	if(debug) {
		console.log(
			", Point 1 Total Rotation: " + this._point1.getTotalRotation()%360 + 
			", Point 2 Total Rotation: " + this._point2.getTotalRotation()%360 + 
			", Rotation Difference: " + rotationDiff
		);
		console.log("X offset: " + xDiff + ", Y offset: " + yDiff + ", Total: " + (xDiff+yDiff));	
	}
	
	if(((xDiff+yDiff) < 100) && rotationDiff < 25) {
		return true;
	}
	
	return false;
}

pm.getPointForPiece = function(piece) {
	if(this._point1.piece == piece) 
		return this._point1;
		
	if(this._point2.piece == piece) 
		return this._point2;
	
	return false;
}

pm.getPointForOtherPiece = function(piece) {
	if(this._point1.piece == piece) 
		return this._point2;
	
	if(this._point2.piece == piece) 
		return this._point1;
	
	return false;
}

pm.removeFromPieces = function() {
	// remove point match from first
	this._point1.piece.removePointMatch(this);
	this._point2.piece.removePointMatch(this);
}