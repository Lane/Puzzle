/** Constant for converting radians to degrees */
var RAD2DEG = 180/Math.PI;
/** Constant for converting degrees to radians */
var DEG2RAD = 1/RAD2DEG;

/** 
 * Creates a point on a piece that can be used to connect two pieces together with a PointMatch
 *
 * @constructor
 * @this {Point}
 * @param {Piece} piece The piece the point is associated with
 * @param {int} x The horizontal offset from the centre of the piece
 * @param {int} y The vertical offset from the centre of the piece
 */
function Point(piece, x, y) {
	
	/**
	 * Horizontal offset from the centre of the piece
	 * @type integer
	 */
	this.x = x;
	
	/**
	 * Vertical offset from the centre of the piece
	 * @type integer
	 */
	this.y = y;
	
	/**
	 * The piece the point is associated with
	 * @type Piece
	 */
	this.piece = piece;
	
	/**
	 * The angle, in degrees, that is formed by the x axis and a line segment from the origin to the point.
	 * 
	 * @type integer
	 */
	this.angle = 0;
	
	/**
	 * Length of the line segment drawn from the origin to the point.
	 *
	 * @type integer
	 */
	this.radius = 0;
	
	this.match = null;
	
	this.initialize();
	
	if(debug) {
		this.circle = new createjs.Shape();
		this.circle.graphics.beginFill("red").drawCircle(0, 0, 5);
		this.circle.x = this.x+piece.regX+piece.x;
		this.circle.y = this.y+piece.regY+piece.y;
		this.piece.parent.addChild(this.circle);
		this.piece.parent.parent._needsUpdate=true;
	}
}

var pt = Point.prototype;

/**
 * Sets initial values of the Point
 *
 * @this {Point}
 */
pt.initialize = function() {
	this.angle = this._calculateAngle();
	this.radius = this.getRadius();
	this.piece.addPoint(this);
}

/**
 * Gets the rotation of the PieceContainer the piece belongs to.
 *
 * @this {Point}
 * @return {int} The rotation in degrees
 */
pt.getTotalRotation = function() {
	return (this.piece.parent.rotation);
}

/**
 * Gets the point coordinates relative to the stage.
 *
 * @this {Point}
 * @return {Object} An object containing the x and y coordinates
 */
pt.getStageOffset = function() {
	var translated = this._calculateRotatedCoordinates(this.getTotalRotation());
	var offset = { 
		x: (translated.x+this.piece.x+this.piece.parent.x),
		y: (translated.y+this.piece.y+this.piece.parent.y)
	}
	return offset;
}

pt.setMatch = function(pt) {
	this.match = pt;
}

pt.getMatch = function() {
	return this.match;
}

pt.isMatched = function() {
	// check the rotation
	var rotDiff = Math.abs(this.getTotalRotation()-this.match.getTotalRotation());
	if(rotDiff > 20)
		return false;
	
	// check the coordinates
	var thisOffset = this.getStageOffset();
	var thatOffset = this.match.getStageOffset();
	var coorDiff = Math.abs(thisOffset.x-thatOffset.x) + Math.abs(thisOffset.y-thatOffset.y);
	if(coorDiff > 50)
		return false;
		
	return true;
}

/**
 * Gets the length of the line segment from the origin to the point
 *
 * @this {Point}
 * @return {int} The length of the line segment from the origin to the point
 */
pt.getRadius = function() {
	return Math.round(Math.sqrt((this.x*this.x)+(this.y*this.y)));
}

/** Update the X and Y coordinates of the circle that represents the point. */
pt.updatePoint = function() {
	if(typeof(this.circle) !== "undefined") {
		this.circle.x =this.x+piece.x;
		this.circle.y = this.y+piece.y;
	} 
}

/**
 * Calculates the updated x and y offset from the origin after a rotation
 *
 * @this {Point}
 * @param {int} rotateAmount the amount to rotate the point, positive for clockwise.
 * @return {Object} The x and y offset of the rotated point
 */
pt._calculateRotatedCoordinates = function(rotateAmount) {
	var netRotation = this.angle-rotateAmount;
	var coordinates = { 
		x: Math.round(Math.cos(netRotation*DEG2RAD)*this.radius), 
		y: -1*Math.round(Math.sin(netRotation*DEG2RAD)*this.radius)
	};

	return coordinates;
}

/**
 * Calculates the angle formed by the x axis and the line segment between the origin and point
 *
 * @this {Point}
 * @return {int} angle formed by origin and line segment from origin to point
 */
pt._calculateAngle = function() {
	var startAngle = 0;
	var realY = this.y*-1;
	var calculatedAngle = Math.round(Math.atan(realY/this.x)*RAD2DEG);
	
	// top right quadrant
	if(this.x > 0 && this.y < 0)
		return calculatedAngle;
	
	// top left quadrant
	if(this.x < 0 && this.y < 0)
		startAngle = 90;

	// bottom left quadrant
	if(this.x < 0 && this.y > 0)
		startAngle = 180;
		
	// bottom right quadrant
	if(this.x > 0 && this.y > 0)
		startAngle = 270;
	
	return (90+calculatedAngle)+startAngle;
}

/**
 * Get a string representation of the point
 *
 * @override
 * @this {Point}
 * @return {string} Human-readable representation of this Point.
 */
pt.toString = function() {
	var stageOffset = this.getStageOffset();
	var pointAngle = this._calculateAngle();
	var pointString = "Point: " + this.x + "," + this.y + "," + pointAngle + "&deg; (" + stageOffset.x + "," + stageOffset.y + ")";
		
	return pointString;
}