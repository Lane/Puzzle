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
	 * PointMatches belonging to this piece
	 * @type PointMatch[]
	 */
	this._pointMatches = options.pointMatches || new Array();
	
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
	  _this.parent.parent._needsUpdate = true;
  }
  
	if(debug) {	
		console.log('Created Piece:');
		console.log(this);
	}
}

/**
 * Removes a PointMatch from the Piece.
 *
 * @this {Piece}
 * @return {boolean} true on success, false on fail
 */
p.removePointMatch = function(pm) {
	if(typeof(pm) == "object") {
		this.removePoint(pm._point1);
		this.removePoint(pm._point2);
		for(var i = 0; i < this._pointMatches.length; i++)
		{
			if((this._pointMatches[i]._point1 == pm._point1) 
						&& (this._pointMatches[i]._point2 == pm._point2)) {
				this._pointMatches.remove(i);
				
				if(debug) {
					console.log("point match removed");
				}
				
				return true;
			}
		}
	}
	return false;
}

/**
 * Adds a PointMatch from the Piece.
 *
 * @this {Piece}
 */
p.addPointMatch = function(pm) {
	if(typeof(pm) == "object") {
		if(!this.hasPointMatch(pm))
		{
			var thisPoint = pm.getPointForPiece(this);
			var thatPoint = pm.getPointForOtherPiece(this);
			
			this._pointMatches.push(pm);
			
			thatPoint.piece.addPointMatch(pm);
		}
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

p.hasPointMatch = function(pm) {
	for(var i = 0; i < this._pointMatches.length; i++) {
		if(this._pointMatches[i] == pm)
			return true;
	}
	return false;
}

p.hasPoint = function(pt) {
	for(var i = 0; i < this._points.length; i++) {
		if(this._points[i] == pt)
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
	for(var i = 0; i < this._pointMatches.length; i++) {
		if(this._pointMatches[i].isMatched()) {
			matches.push(this._pointMatches[i]);
		}
	}
	return matches;
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
