/** 
 * Creates a puzzle piece
 *
 * @constructor
 * @augments createjs.Bitmap
 * @this {Piece}
 * @param {string} imageSrc The location of the image representing the piece
 * @param {Object} overrides Option overrides
 */
function Piece(imageSrc, overrides) {

	var options = overrides || {};
	
	/**
	 * Points belonging to this piece
	 * @type Point[]
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
	
	/**
	 * The boundary for this piece
	 * @type {Boundary}
	 */
	this.boundary = options.boundary || null;
	
	var tmpImg = new Image();
	tmpImg.src = imageSrc;
	
	this.initialize(tmpImg);
	
}
	
var p = Piece.prototype = new createjs.Bitmap();

p.Bitmap_initialize = p.initialize;
	
p.initialize = function(image) {

	// create image bitmap constructor
  this.Bitmap_initialize(image);
  
  var _this = this;
  
  // set image related parameters once the image has loaded
  image.onload = function() {
	  _this.regX = _this.image.width/2|0;
	  _this.regY = _this.image.height/2|0;
	  _this.name = _this.image.src.split('/')[_this.image.src.split('/').length-1];
	  _this.setBoundary();
	  if(_this.parent !== null) {
		  _this.parent.setBoundingBox();
		  _this.parent.parent._needsUpdate = true;
	  }
	  else {
	  	debug.warn(_this, "This Piece has no parent, every piece should have a parent PieceContainer");
	  }
  }
  
	debug.log(this, 'Created Piece');

}

// SETTERS
// --------------

p.setBoundary = function() {
	var left = -(this.image.width*this.scaleX/2);
	var top = -(this.image.height*this.scaleY/2);
	var width = this.image.width*this.scaleX;
	var height = this.image.height*this.scaleY;
	this.boundary = new Boundary(left, top, width, height);
}

// GETTERS
// --------------

p.getBoundary = function() {
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

/**
 * Adds a Point to the Piece.
 *
 * @this {Piece}
 */
p.addPoint = function(pt) {
	if(!this.hasPoint(pt))
		this._points.push(pt);
}

p.hasPoint = function(pt) {
	for(var i = 0; i < this._points.length; i++) {
		if(this._points[i].isEqual(pt))
			return true;
	}
	return false;
}

p.removePoint = function(pt) {
	for(var i = 0; i < this._points.length; i++)
	{
		if(this._points[i] == pt)
		{
			this._points.remove(i);
			return this._points;
		}
	}
	return false;
}

p.getMatches = function() {
	var matches = new Array();
	for(var i = 0; i < this._points.length; i++) {
		if(this._points[i].isMatched()) {
			matches.push(this._points[i]);
		}
	}
	return matches;
}

p.isEqual = function(pc2) {
	if(this.id == pc2.id) {
		return true;
	}
	return false;
}

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
