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
	xDiff = Math.abs(this._point1.getStageOffset().x - this._point2.getStageOffset().x);
	yDiff = Math.abs(this._point1.getStageOffset().y - this._point2.getStageOffset().y);
	
	if(debug) {
		console.log("Point 1 Stage Offset: " + this._point1.getStageOffset().x +
			", Point 2 Stage Offset: " + this._point2.getStageOffset().x);
		console.log("X offset: " + xDiff + ", Y offset: " + yDiff + ", Total: " + (xDiff+yDiff));
	}
	
	if((xDiff+yDiff) < 100) {
		return true;
	}
	return false;
}

pm.removeFromPieces = function() {
	// remove point match from first
	this._point1.piece.removePointMatch(this);
	this._point2.piece.removePointMatch(this);
}