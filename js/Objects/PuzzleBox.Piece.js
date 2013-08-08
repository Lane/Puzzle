var PuzzleBox = PuzzleBox || {};

/** 
 * Represents a Piece of the puzzle
 *
 * @constructor
 * @augments createjs.Bitmap
 * @param {Object} options Option overrides
 * @property {Array} _points - Points belonging to this piece
 * @property {number} scale - Amount to scale the piece
 * @property {int} x - Horizontal offset from the origin of the parent Piece Container
 * @property {int} y - Vertical offset from the origin of the parent Piece Container
 * @property {string} type - Type of DisplayObject this is
 * @property {Boundary} boundary - The boundary for this piece
 */
PuzzleBox.Piece = function(options) {

	this._points = options.points || new Array();

	this.scaleX = this.scaleY = this.scale = options.scale || 1;

	this.x = options.x || 0;

	this.y = options.y || 0;
	
	this.displayName = options.displayName || "Unnamed Piece";
	
	this.zindex = options.zindex || 1;
	
	if(typeof(options.fixed) !== "undefined")
		this.fixed = true;
		
	this.parentX = options.parentX || 0;
	this.parentY = options.parentY || 0;

	this.snapRadius = options.snapRadius || 25;
	
	this.type = "piece";
	
	if(options.name !== null)
		this.name = options.name;
	
	this.boundary = options.boundary || new PuzzleBox.Boundary(9999, 9999, (2*-9999), (2*-9999));
	
	this.initialize(options);

};
	
var p = PuzzleBox.Piece.prototype = new createjs.Bitmap();

p.Bitmap_initialize = p.initialize;
	
p.initialize = function(options) {
	var tmpImg;
	var _this = this;

	if((typeof(options.img) == "undefined") 
		&& (typeof(options.imgSrc) !== "undefined")) {
		//imgsrc is set            
		tmpImg = new Image();
		tmpImg.src = options.imgSrc;
		tmpImg.onload = function (e) { 
			// create image bitmap constructor
			_this.Bitmap_initialize(this);
			_this.setAttributes(); 
		}
	} else if((typeof(options.img) !== "undefined") 
		&& (typeof(options.imgSrc) == "undefined")) {
		//img object is set
		tmpImg = options.img;
		this.Bitmap_initialize(tmpImg);
		this.setAttributes();
	}

	if(typeof(tmpImg) == "undefined") {
		debug.warn("Made a piece without an image.");
	}
	debug.log('Created Piece:', this);
};

// SETTERS
// --------------

/**
 * Sets attributes
 * @method Piece.setAttributes
 * @returns {Piece} This piece
 */
p.setAttributes = function() {
	this.regX = this.image.width/2|0;
	this.regY = this.image.height/2|0;
	this.setBoundary();
	try {
		var ptpc = this.getParentPieceContainer();
		ptpc.setBoundary();
		ptpc.parent._needsUpdate = true;
	} catch(err) {
		debug.warn(
			"This Piece has no parent, every piece " +
			"should have a parent PieceContainer", 
			this,
			err
		);
	}
	
	return this;
};

/**
 * Sets the boundary for the piece
 * @method Piece.setBoundary
 * @returns {Piece} This piece
 */
p.setBoundary = function() {
	var left = this.x-Math.round((this.image.width*this.scaleX/2));
	var top = this.y-Math.round((this.image.height*this.scaleY/2));
	var width = Math.round(this.image.width*this.scaleX);
	var height = Math.round(this.image.height*this.scaleY);
	this.boundary.set(left, top, width, height);
	return this;
};

// GETTERS
// --------------

/**
 * Gets the boundary for the Piece
 * @method Piece.getPieceBoundary
 * @returns {Boundary} The piece boundary
 */
p.getPieceBoundary = function() {
	return this.boundary;
};

/**
 * Gets the parent PieceContainer
 * @method Piece.getParentPieceContainer
 * @returns {PieceContainer} The parent piece container
 */
p.getParentPieceContainer = function() {
	try {
		return this.parent;
	} catch(err) {
		debug.warn(
			"Trying to access parent of a Piece, but it has not been set", 
			this,
			err
		);
		return null;
	}
};

/**
 * Gets the points that belong to this Piece
 * @method Piece.getPoints
 * @returns {Array} An array of points that belong to this Piece
 */
p.getPoints = function() {
	return this._points;
};

/**
 * Checks all of the points for this piece to see if they are within range of their match
 * @method Piece.getMatches
 * @returns {Array} points that are matched
 */
p.getMatches = function() {
	var matches = new Array();
	for(var i = 0; i < this._points.length; i++) {
		if(this._points[i].isMatched()) {
			matches.push(this._points[i]);
		}
	}
	return matches;
};

// METHODS
// --------------

/**
 * Adds a Point to the Piece.
 * @method Piece.addPoint
 * @param {Point} the point to add
 * @returns {Piece} this piece 
 */
p.addPoint = function(pt) {
	// LANE CHANGED ON JULY 19 TO ALLOW SNAP ALL
	//if(!this.hasPoint(pt)) {
	//	this._points.push(pt);
	//	pt.setPiece(this);
	//}
	this._points.push(pt);
	pt.setPiece(this);
	return this;
};

/**
 * Checks to see if this piece has a specific point
 * @method Piece.hasPoint
 * @param {Point} the point to compare
 * @returns {boolean} true or false based on if the piece has the point passed
 */
p.hasPoint = function(pt) {
	for(var i = 0; i < this._points.length; i++) {
		if(this._points[i].isEqual(pt))
			return true;
	}
	return false;
};

p.updatePoints = function() {
	for(var i = 0; i < this._points.length; i++) {
		this._points[i].updatePoint();
	}
	return this;
};

/**
 * Removes a point to the piece
 * @method Piece.removePoint
 * @param {Point} the point to remove
 * @returns {Piece} this piece 
 */
p.removePoint = function(pt) {
	for(var i = 0; i < this._points.length; i++)
	{
		if(this._points[i] == pt)
		{
			this._points.remove(i);
		}
	}
	return this;
};

p.removeAllPoints = function() {
	this._points = new Array();
	return this;
};

/**
 * Checks to see if two pieces are the same
 * @method Piece.isEqual
 * @param {Piece} the point to compare
 * @returns {boolean} true or false based on if they are the same
 */
p.isEqual = function(pc2) {
	if(this.id == pc2.id) {
		return true;
	}
	return false;
};

/**
 * Get a string representation of the Piece
 * @override
 * @method Piece.toString
 * @returns {string} Human-readable representation of this Piece.
 */
p.toString = function() {
	var pieceString = this.name + "\n"
		+ "Position: " + this.x + "," + this.y + "\n"
		+ "Rotation: " + this.rotation + "\n"
		+ "Centre: " + this.regX + "," + this.regY + "\n"
		+ "Scale: " + this.scaleX + "," + this.scaleY + "\n";
		
	if(typeof(this.image) !== "undefined") {
		pieceString += "Image Dimensions: " 
			+ this.image.width + "x" + this.image.height + "\n";
	}
		
	for(var i = 0; i < this._points.length; i++) {
		pieceString += this._points[i].toString();
	}
	
	pieceString += "\n";
	
	return pieceString;
};

/**
 * Get an HTML representation of the Piece
 * @method Piece.toHTMLString
 * @returns {string} HTML representation of this Piece.
 */
p.toHTMLString = function() {
	var pieceString = "<h4>" + this.name + "</h4>"
		+ "<ul class='properties'>" 
		+ "<li><span>Position: </span>" + this.x + "," + this.y + "</li>"
		+ "<li><span>Rotation: </span>" + this.rotation + "</li>"
		+ "<li><span>Centre: </span>" + this.regX + "," + this.regY + "</li>"
		+ "<li><span>Scale: </span>" + this.scaleX + "," + this.scaleY + "</li>";
		
	if(typeof(this.image) !== "undefined") {
		pieceString += "<li>Image Dimensions: " + this.image.width + "x" + this.image.height + "</li>";
	}
		
	for(var i = 0; i < this._points.length; i++) {
		pieceString += "<li>" + this._points[i].toString() + "</li>";
	}
	
	pieceString += "</ul>";
	
	return pieceString;
};
