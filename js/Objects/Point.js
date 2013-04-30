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
function Point(piece, x, y, origin) {
	
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
	this.piece = piece || null;
	
	/**
	 * The origin of the point
	 * @type object
	 */
	this.origin = origin || { x:0, y:0 };
	 
	
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
	
	/**
	 * The matching point that this point connects to
	 *
	 * @type Point
	 */
	this.match = null;
	
	this._stageOffset = { x:0, y:0 }
	
	this.initialize();

}

var pt = Point.prototype;

/**
 * Sets initial values of the Point
 *
 * @this {Point}
 */
pt.initialize = function() {
	this.setAngle().setRadius().setOffset();
	if(this.piece !== null)
		this.piece.addPoint(this);
}

// SETTERS
// --------------

/**
 * Sets the point that this point connects to 
 *
 * @this {Point}
 */
pt.setPosition = function(pos) {
	this.x = pos.x;
	this.y = pos.y;
	return this;
}

/**
 * Sets the point that this point connects to 
 *
 * @this {Point}
 */
pt.setMatch = function(pt) {
	this.match = pt;
	pt.match = this;
	return this;
}

/**
 * Sets the angle made by the point, origin, and x axis 
 *
 * @this {Point}
 */
pt.setAngle = function() {
	this.angle = this._calculateAngle(this.getOffsetFromOrigin());
	return this;
}

/**
 * Sets the radius (length the line segment made by origin and point)
 *
 * @this {Point}
 */
pt.setRadius = function() {
	this.radius = this._calculateRadius(this.getOffsetFromOrigin());
	return this;
}

/**
 * Sets the stage offset
 *
 * @this {Point}
 */
pt.setOffset = function() {
	var translated = this._calculateRotatedCoordinates(this.getTotalRotation());
	if(this.piece !== null) {
		translated.x = (translated.x+this.piece.x+this.piece.getParentPieceContainer().x);
		translated.y = (translated.y+this.piece.y+this.piece.getParentPieceContainer().y);
	} else {
		debug.warn("STAGE OFFSET MAY BE INCORRECT: There is no parent piece for this point.", this);
	}
	this._stageOffset = translated;
	return this;
}

/**
 * Sets the origin coordinates of this point (for rotation)
 *
 * @this {Point}
 * @param {Coordinate} o The coordinates of the origin
 */
pt.setOrigin = function(o) {
	this.origin = o;
	
	// new angle and radius after origin change
	return this.setAngle().setRadius();
}

pt.setPiece = function(pc) {
	this.piece = pc;
}

// GETTERS
// --------------

/**
 * Gets the piece belongs this point belongs to.
 *
 * @this {Point}
 * @returns {int} The rotation in degrees
 */
pt.getPiece = function() {
	return this.piece;
}

/**
 * Gets the rotation of the PieceContainer the piece belongs to.
 *
 * @this {Point}
 * @returns {int} The rotation in degrees
 */
pt.getTotalRotation = function() {
	if(typeof(this.piece) !== 'undefined' && this.piece !== null) {
		if(typeof(this.piece.parent) !== 'undefined' && this.piece.parent !== null) {
			return (this.piece.getParentPieceContainer().rotation);
		} else {
			debug.warn("Rotation of point may be incorrect because the Point this Piece is associated with has no PieceContainer", this);
			return 0;
		}
	} else {
		debug.warn("Rotation of point may be incorrect because the Point this Piece is null", this);
		return 0;
	}
}

/**
 * Gets the point coordinates relative to the stage.
 *
 * @this {Point}
 * @returns {Object} An object containing the x and y coordinates
 */
pt.getStageOffset = function() {
	return this._stageOffset;
}

/**
 * Gets the point coordinates relative to the parent.
 *
 * @this {Point}
 * @returns {Object} An object containing the x and y coordinates
 */
pt.getParentOffset = function() {
	return { 
		x: (this.x+this.piece.x),
		y: (this.y+this.piece.y)
	};
}

/**
 * Gets the point that this point connects to
 *
 * @this {Point}
 * @returns {Point} The matching point
 */
pt.getMatch = function() {
	return this.match;
}

/**
 * Gets the offset from the origin
 *
 * @this {Point}
 * @returns {Coordinate} Contains the x and y offset from the origin
 */
pt.getOffsetFromOrigin = function() {
	return {
		x: this.x-this.origin.x, 
		y: this.y-this.origin.y
	};
}

/**
 * Gets the radius
 *
 * @this {Point}
 * @returns {int} The distance of the segment between the origin and point
 */
pt.getRadius = function() {
	return this.radius;
}

/**
 * Gets the angle
 *
 * @this {Point}
 * @returns {int} The angle formed by the x axis an the line segment from the radius to the origin
 */
pt.getAngle = function() {
	return this.angle;
}

// FUNCTIONS
// --------------

/** 
 * Update the circle that represents the point
 *
 * @this {Point}
 */
pt.updatePoint = function() {
	this.setAngle().setRadius().setOffset();
	return this;
}

/** 
 * Check if this Point equals the same as the point passed
 *
 * @this {Point}
 * @param {Point} pt2 The point to compare
 */
pt.isEqual = function(pt2) {
	var eq = false;
	// check coordinates and origin
	if((this.x == pt2.x) && (this.y == pt2.y) 
		&& (this.origin.x == pt2.origin.x)
		&& (this.origin.y == pt2.origin.y)) {
		// check if both pieces are null
		if((this.piece == null && pt2.piece == null)) {
			eq = true;
			debug.warn("Points are equal, but may be flawed as they are not associated with a piece.", this, pt2);
		}
		// if pieces are not null, check if they're equal
		if((this.piece !== null && pt2.piece !== null) 
			&& this.piece.isEqual(pt2.piece)) {
			eq = true;
		}
	}
	return eq;
}

/** 
 * Check if this Point is within range of its match
 *
 * @this {Point}
 */
pt.isMatched = function() {
	// check the rotation
	if(this.match == null) {
		debug.warn("Checking if there is a match for a point with no match");
		return false;
	}
	var rotDiff = Math.abs((this.getTotalRotation()%360)-(this.match.getTotalRotation()%360));
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
 * Calculates the updated x and y offset from the origin after a rotation
 *
 * @this {Point}
 * @param {int} rotateAmount the amount to rotate the point, positive for clockwise.
 * @returns {Object} The x and y offset of the rotated point
 */
pt._calculateRotatedCoordinates = function(rotateAmount) {
	var netRotation = this.angle-rotateAmount;
	var coordinates = { 
		x: Math.round(Math.cos(netRotation*DEG2RAD)*this.radius), 
		y: Math.round(-1*Math.sin(netRotation*DEG2RAD)*this.radius)
	};
	
	return coordinates;
}

/**
 * Calculates the angle formed by the x axis and the line segment between the origin and point
 *
 * @this {Point}
 * @returns {int} angle formed by origin and line segment from origin to point
 */
pt._calculateAngle = function(offset) {

	var startAngle = 0;
	var newPos = offset;
	var calculatedAngle = Math.atan(-newPos.y/newPos.x)*RAD2DEG;
	
	if(newPos.y == 0) {
		if(newPos.x >= 0) {
			return 0;
		} else {
			return 180;
		}
	}
	
	if(newPos.x == 0) {
		if(newPos.y <= 0) {
			return 90;
		} else {
			return 270;
		}
	}
	
	// top right quadrant
	if(newPos.x > 0 && newPos.y < 0)
		return calculatedAngle;
	
	// top left quadrant
	if(newPos.x < 0 && newPos.y < 0)
		startAngle = 90;

	// bottom left quadrant
	if(newPos.x < 0 && newPos.y > 0)
		return (180+calculatedAngle);
		
	// bottom right quadrant
	if(newPos.x > 0 && newPos.y > 0)
		startAngle = 270;
	
	return (90+calculatedAngle)+startAngle;
}


/**
 * Gets the length of the line segment from the origin to the point
 *
 * @this {Point}
 * @returns {int} The length of the line segment from the origin to the point
 */
pt._calculateRadius = function(offset) {
	var xy = offset;
	return Math.sqrt((xy.x*xy.x)+(xy.y*xy.y));
}


/**
 * Get a string representation of the point
 *
 * @override
 * @this {Point}
 * @returns {string} Human-readable representation of this Point.
 */
pt.toString = function() {
	var stageOffset = [this.getStageOffset(), this.match.getStageOffset()];
	var pointString = "Point: " + stageOffset[0].x + "," + stageOffset[0].y + " (" + Math.abs(stageOffset[0].x-stageOffset[1].x) + "," + Math.abs(stageOffset[0].y-stageOffset[1].y) + ")";
		
	return pointString;
}