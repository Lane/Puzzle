var PuzzleBox = PuzzleBox || {};

/** 
 * Creates a point on a piece that can be used to connect two pieces together with a PointMatch
 *
 * @constructor
 * @param {Piece} piece The piece the point is associated with
 * @param {int} x The horizontal offset from the centre of the piece
 * @param {int} y The vertical offset from the centre of the piece
 * @property {int} x - Horizontal offset from the centre of the piece
 * @property {int} y - Vertical offset from the centre of the piece
 * @property {int} angle - The angle, in degrees, that is formed by the x axis and a line segment from the origin to the point.
 * @property {Piece} piece - The piece the point is associated with
 * @property {int} radius - Length of the line segment drawn from the origin to the point. 
 * @property {Point} match - The matching point that this point connects to
 * @property {Object} _stageOffset - An object containing the x and y offset of the Point relative to the stage
 */
PuzzleBox.Point = function(piece, x, y, origin) {
	this.x = x;
	this.y = y;
	this.piece = piece || null;
	this.angle = 0;
	this.radius = 0;
	this.match = null;
	this._stageOffset = { x:0, y:0 }
	this.initialize();
};

var pt = PuzzleBox.Point.prototype;

/**
 * Sets initial values of the Point
 */
pt.initialize = function() {
	this.setAngle().setRadius().setOffset();
	if(this.piece !== null)
		this.piece.addPoint(this);
};

// SETTERS
// --------------

/**
 * Sets the point that this point connects to 
 * @method Point.setPosition
 */
pt.setPosition = function(pos) {
	this.x = pos.x;
	this.y = pos.y;
	return this;
};

/**
 * Sets the point that this point connects to 
 * @method Point.setMatch
 */
pt.setMatch = function(pt) {
	this.match = pt;
	pt.match = this;
	return this;
};

/**
 * Sets the angle made by the point, origin, and x axis 
 * @method Point.setAngle
 */
pt.setAngle = function() {
	this.angle = this._calculateAngle(this.getOffsetFromOrigin());
	return this;
};

/**
 * Sets the radius (length the line segment made by origin and point)
 * @method Point.setRadius
 */
pt.setRadius = function() {
	this.radius = this._calculateRadius(this.getOffsetFromOrigin());
	return this;
};


/**
 * Sets the stage offset
 * @method Point.setOffset
 */
pt.setOffset = function() {
	var translated = 
		this._calculateRotatedCoordinates(this.getTotalRotation());
	var coords = {};
	if(this.piece !== null) {
		if(ptpc = this.piece.getParentPieceContainer()) {
			coords.x = ptpc.x+translated.x;
			coords.y = ptpc.y+translated.y;
		} else {
			debug.warn(
				"No parent piece container when setting offset for point:", 
				this
			);
		}
	} else {
		debug.warn(
			"Stage offset may be incorrect because there " +
			"is no parent piece for this point.", 
			this
		);
	}
	this._stageOffset = coords;
	return this;
};

/**
 * Sets the piece that this point belongs to
 * @method Point.setPiece
 */
pt.setPiece = function(pc) {
	this.piece = pc;
};

// GETTERS
// --------------

/**
 * Gets the piece belongs this point belongs to.
 * @method Point.getPiece
 * @returns {int} The rotation in degrees
 */
pt.getPiece = function() {
	return this.piece;
};

/**
 * Gets the rotation of the PieceContainer the piece belongs to.
 * @method Point.getTotalRotation
 * @returns {int} The rotation in degrees
 */
pt.getTotalRotation = function() {
	if(	
		typeof(this.piece) !== 'undefined' && 
		this.piece !== null
	) {
		if(
			typeof(this.piece.parent) !== 'undefined' && 
			this.piece.parent !== null
		) {
			return (this.piece.parent.rotation);
		} else {
			debug.warn(
				"Rotation of point may be incorrect because the Point " +
				"this Piece is associated with has no PieceContainer", 
				this
			);
			return 0;
		}
	} else {
		debug.warn(
			"Rotation of point may be incorrect  " +
			"because the Point this Piece is null", 
			this
		);
		return 0;
	}
};

/**
 * Gets the point coordinates relative to the stage.
 * @method Point.getStageOffset
 * @returns {Object} An object containing the x and y coordinates
 */
pt.getStageOffset = function() {
	return this._stageOffset;
};

/**
 * Gets the point coordinates relative to the parent.
 * @method Point.getParentOffset
 * @returns {Object} An object containing the x and y coordinates
 */
pt.getParentOffset = function() {
	return { 
		x: (this.x+this.piece.x),
		y: (this.y+this.piece.y)
	};
};

/**
 * Gets the point that this point connects to
 * @method Point.getMatch
 * @returns {Point} The matching point
 */
pt.getMatch = function() {
	return this.match;
};

/**
 * Gets the offset from the origin
 * @method Point.getOffsetFromOrigin
 * @returns {Coordinate} Contains the x and y offset from the origin
 */
pt.getOffsetFromOrigin = function() {
	try {
		// Point Position + (Piece Position - PieceContainer Centre)
		var offset = {
			x: this.x+(this.piece.x-this.piece.parent.regX), 
			y: this.y+(this.piece.y-this.piece.parent.regY) // this was a - i changed to a +
		};
	} catch (err) {
		debug.warn("Attempted to get offset of piece with no parent.", err);
		var offset = { x: this.x, y: this.y };
	}
	return offset;
};

/**
 * Gets the radius
 * @method Point.getRadius
 * @returns {int} The distance of the segment between the origin and point
 */
pt.getRadius = function() {
	return this.radius;
};

/**
 * Gets the angle
 * @method Point.getAngle
 * @returns {int} The angle formed by the x axis an the line segment from the radius to the origin
 */
pt.getAngle = function() {
	return this.angle;
};

// FUNCTIONS
// --------------

/**
 * Recalculate the angle, radius, and offset
 * @method Point.updatePoint
 */
pt.updatePoint = function() {
	this.setAngle().setRadius().setOffset();
	return this;
};

/**
 * Check if this Point equals the same as the point passed
 * @method Point.isEqual
 * @param {Point} pt2 The point to compare
 */
pt.isEqual = function(pt2) {
	var eq = false;
	// check coordinates and origin
	if((this.x == pt2.x) && (this.y == pt2.y)) {
		// check if both pieces are null
		if((this.piece == null && pt2.piece == null)) {
			eq = true;
			debug.warn(
				"Points are equal, but may be flawed as " + 
				"they are not associated with a piece.", 
				this, 
				pt2
			);
		}
		// if pieces are not null, check if they're equal
		if((this.piece !== null && pt2.piece !== null) 
			&& this.piece.isEqual(pt2.piece)) {
			eq = true;
		}
	}
	return eq;
};

/**
 * Check if this Point is within range of its match
 * @method Point.isMatched
 */
pt.isMatched = function() {
	// check the rotation
	if(this.match == null) {
		debug.warn("Checking if there is a match for a point with no match");
		return false;
	}
	var rotDiff = Math.abs(
		(this.getTotalRotation()%360)-(this.match.getTotalRotation()%360)
	);
	if(rotDiff > 45)
		return false;
	
	// check the coordinates
	var thisOffset = this.getStageOffset();
	var thatOffset = this.match.getStageOffset();
	var coorDiff = {
		x: Math.abs(thisOffset.x-thatOffset.x), 
		y: Math.abs(thisOffset.y-thatOffset.y)
	};
	if(coorDiff.x > this.piece.snapRadius || coorDiff.y > this.piece.snapRadius)
		return false;
		
	return true;
};

/**
 * Calculates the updated x and y offset from the origin after a rotation
 * @method Point._calculateRotatedCoordinates
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
};

/**
 * Calculates the angle formed by the x axis and the line segment between the origin and point
 * @method Point._calculateAngle
 * @params {Object} offset The current offset of the point from the origin
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
};


/**
 * Gets the length of the line segment from the origin to the point
 * @method Point._calculateRadius
 * @params {Object} offset The offset from the origin
 * @returns {int} The length of the line segment from the origin to the point
 */
pt._calculateRadius = function(offset) {
	var xy = offset;
	return Math.sqrt((xy.x*xy.x)+(xy.y*xy.y));
};


/**
 * Get a string representation of the point
 * @method Point.toString
 * @override
 * @returns {string} Human-readable representation of this Point.
 */
pt.toString = function() {
	var stageOffset = [this.getStageOffset(), this.match.getStageOffset()];
	var pointString = "Point: " + "<ul style='margin-left:10px;'><li>" +
		"Stage Offset: " + 
			stageOffset[0].x + "," + stageOffset[0].y + "</li><li>" +
		"Piece Offset: " + 
			this.x + "," + this.y + "</li><li>" +
		"Piece Container Offset: " + 
			this.getOffsetFromOrigin().x + "," + this.getOffsetFromOrigin().y + "</li><li>" +
		"Distance From Match: " + 
			Math.abs(stageOffset[0].x-stageOffset[1].x) + "," 
				+ Math.abs(stageOffset[0].y-stageOffset[1].y) + "</li><li>" + 
		"Angle, Radius: " + 
			this.angle + ", " + this.radius + "</li></ul>";
		
	return pointString;
};