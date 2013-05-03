/** 
 * Represents a Piece of the puzzle
 *
 * @constructor
 * @augments createjs.Bitmap
 * @this {Piece}
 * @param {Object} options Option overrides
 */
function Piece(options) {
	
	/**
	 * Points belonging to this piece
	 * @type {Point[]}
	 */
	this._points = options.points || new Array();
	
	/**
	 * Amount to scale the piece
	 * @type {number}
	 */
	this.scaleX = this.scaleY = this.scale = options.scale || 1;
	
	/**
	 * Horizontal offset from the origin of the parent Piece Container
	 * @type {int}
	 */
	this.x = options.x || 0;
	
	/**
	 * Vertical offset from the origin of the parent Piece Container
	 * @type {int}
	 */
	this.y = options.y || 0;
	
	/**
	 * Type of DisplayObject this is
	 * @type {string}
	 */
	this.type = "piece";
	
	if(options.name !== null)
		this.name = options.name;
	
	/**
	 * The boundary for this piece
	 * @type {Boundary}
	 */
	this.boundary = options.boundary || new Boundary(9999, 9999, (2*-9999), (2*-9999));
	
	this.initialize(options);
	
}
	
var p = Piece.prototype = new createjs.Bitmap();

p.Bitmap_initialize = p.initialize;
	
p.initialize = function(options) {
	var tmpImg;
	var _this = this;

	if((typeof(options.img) == "undefined") && (typeof(options.imgSrc) !== "undefined")) {
		//imgsrc is set            
		tmpImg = new Image();
		tmpImg.src = options.imgSrc;
		tmpImg.onload = function (e) { 
			// create image bitmap constructor
			_this.Bitmap_initialize(this);
			_this.setAttributes(); 
		}
	} else if((typeof(options.img) !== "undefined") && (typeof(options.imgSrc) == "undefined")) {
		//img object is set
		tmpImg = options.img;
		this.Bitmap_initialize(tmpImg);
		this.setAttributes();
	}

	if(typeof(tmpImg) == "undefined") {
		debug.warn("Made a piece without an image.");
	}
	debug.log('Created Piece:', this);
}

// SETTERS
// --------------

p.setAttributes = function() {
	this.regX = this.image.width/2|0;
	this.regY = this.image.height/2|0;
	this.setBoundary();
	if(this.parent !== null) {
	  this.parent.setBoundary();
	  this.parent.parent._needsUpdate = true;
	}
	else {
		debug.warn("This Piece has no parent, every piece should have a parent PieceContainer", this);
	}
	return this;
}

p.setBoundary = function() {
	var left = this.x-Math.round((this.image.width*this.scaleX/2));
	var top = this.y-Math.round((this.image.height*this.scaleY/2));
	var width = Math.round(this.image.width*this.scaleX);
	var height = Math.round(this.image.height*this.scaleY);
	this.boundary.set(left, top, width, height);
	return this;
}

// GETTERS
// --------------

p.getPieceBoundary = function() {
	return this.boundary;
}

p.getParentPieceContainer = function() {
	if(this.parent !== null && typeof(this.parent) !== "undefined") {
		return this.parent;
	} else {
		debug.warn("Trying to access parent of a Piece, but it has not been set", this);
		return false;
	}
}

p.getPoints = function() {
	return this._points;
}

/**
 * Checks all of the points for this piece to see if they are within range of their match
 *
 * @this {Piece}
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
}

// FUNCTIONS
// --------------

/**
 * Adds a Point to the Piece.
 *
 * @this {Piece}
 * @param {Point} the point to add
 * @returns {Piece} this piece 
 */
p.addPoint = function(pt) {
	if(!this.hasPoint(pt)) {
		this._points.push(pt);
		pt.setPiece(this);
	}
	return this;
}

/**
 * Checks to see if this piece has a specific point
 *
 * @this {Piece}
 * @param {Point} the point to compare
 * @returns {boolean} true or false based on if the piece has the point passed
 */
p.hasPoint = function(pt) {
	for(var i = 0; i < this._points.length; i++) {
		if(this._points[i].isEqual(pt))
			return true;
	}
	return false;
}

p.updatePoints = function() {
	for(var i = 0; i < this._points.length; i++) {
		this._points[i].updatePoint();
	}
}

/**
 * Removes a point to the piece
 *
 * @this {Piece}
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
}

p.removeAllPoints = function() {
	return this._points = new Array();
}

/**
 * Checks to see if two pieces are the same
 *
 * @this {Piece}
 * @param {Piece} the point to compare
 * @returns {boolean} true or false based on if they are the same
 */
p.isEqual = function(pc2) {
	if(this.id == pc2.id) {
		return true;
	}
	return false;
}

/**
 * Get a string representation of the Piece
 *
 * @override
 * @this {Piece}
 * @returns {string} Human-readable representation of this Piece.
 */
p.toString = function() {
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
}
