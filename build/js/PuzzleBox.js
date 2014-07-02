Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/** 
 * Constant for converting radians to degrees 
 * @name RAD2DEG
 * @global 
 */
var RAD2DEG = 180/Math.PI;


/** 
 * Constant for converting degrees to radians
 * @name DEG2RAD
 * @global 
 */
var DEG2RAD = 1/RAD2DEG;
var PuzzleBox = PuzzleBox || {};

/** 
 * Represents an event that happens within the puzzle.
 *
 * @constructor
 * @param {Object} sender The object that is sending the event
 */
PuzzleBox.Event = function(sender) {
  this._sender = sender;
  this._listeners = [];
};

var ep = PuzzleBox.Event.prototype;

/**
 * Attaches a function to execute whenever this event is fired.
 * @method Event.attach
 * @param {Object} listener The function to attach to this event
 */
ep.attach = function (listener) {
	this._listeners.push(listener);
};

/**
 * Notifies this event that it has been fired, then executes each
 * of the functions that have been attached to this event.
 * @method Event.notify
 * @param {Object} args The arguments to pass to the listener functions
 */
ep.notify = function (args) {
  var index;

  for (index = 0; index < this._listeners.length; index += 1) {
  	this._listeners[index](this._sender, args);
  }
};var PuzzleBox = PuzzleBox || {};

/** 
 * Represents a rectangular boundary for Pieces and PieceContainers 
 *
 * @constructor
 * @param {int} x The horizontal offset from the centre
 * @param {int} y The vertical offset from the centre
 * @param {int} width The width of the boundary
 * @param {int} height the height of the boundary
 * @property {int} top - x The top position of the boundary
 * @property {int} left - y The left position of the boundary
 * @property {int} width - The width of the boundary
 * @property {int} height - the height of the boundary
 */
PuzzleBox.Boundary = function(left, top, width, height) {

	this.top = top;
	
	this.left = left;
	
	this.width = width;
	
	this.height = height;
	
	this.initialize();

};

var bd = PuzzleBox.Boundary.prototype;

bd.initialize = function() {
	this.set(this.left, this.top, this.width, this.height);
};


// SETTERS
// --------------

/**
 * Sets the dimensions and position of the Boundary
 * @method Boundary.set
 * @param {int} left The left position of the boundary
 * @param {int} top The top position of the boundary
 * @param {int} width The width of the boundary
 * @param {int} height The height of the boundary
 * @returns {Boundary} Returns this boundary
 */
bd.set = function(left, top, width, height) {
	this.top = top;
	this.right = left+width;
	this.bottom = top+height;
	this.left = left;
	this.width = width;
	this.height = height;
	this.center = { x: left+width/2, y: top+height/2 };
	return this;
};

/**
 * Sets the width and height of the Boundary 
 * @method Boundary.setDimensions
 * @param {Object} dim An object containing the width and height
 * @returns {Boundary} Returns this boundary
 */
bd.setDimensions = function(dim) {
	return this.set(this.left, this.top, dim.width, dim.height);
};

/**
 * Sets the position of the boundary
 * @method Boundary.setPosition
 * @param {int} x The x position to set the boundary to
 * @param {int} y The y position to set the boundary to
 * @returns {Boundary} Returns this boundary
 */
bd.setPosition = function(x,y) {
	return this.set(x,y,this.width,this.height);
};

// GETTERS
// --------------

/**
 * Gets the top left point of the boundary
 * @method Boundary.getTopLeft
 * @returns {Object} Returns the top left point of the boundary
 */
bd.getTopLeft = function() {
	return { x: this.left, y: this.top } 
};

/**
 * Gets the center point of the boundary
 * @method Boundary.getCenter
 * @returns {Object} Returns the center point of the boundary
 */
bd.getCenter = function() {
	return this.center;
};

/**
 * Gets the width and height of the boundary
 * @method Boundary.getDimensions
 * @returns {Object} Returns an object containing width and height
 */
bd.getDimensions = function() {
	return { width: this.width, height: this.height }
};


// METHODS
// --------------

/**
 * Checks to see if this boundary is equal to another boundary
 * @method Boundary.isEqual
 * @param {Boundary} bd The boundary to compare to
 * @returns {boolean} Returns true if boundaries are equal
 */
bd.isEqual = function(bd) {
	if((typeof(bd.top) !== "undefined")
		&& (typeof(bd.left) !== "undefined")
		&& (typeof(bd.width) !== "undefined")
		&& (typeof(bd.height) !== "undefined")) {

		if((this.top == bd.top) 
			&& (this.left == bd.left)
			&& (this.width == bd.width)
			&& (this.height == bd.height)) {
			return true;
		}
	}
	return false;
};

/**
 * Extends this boundary to encompass the `box` passed to it
 * @method Boundary.extendBoundary
 * @param {Boundary} box The box to encompass with this boundary
 * @returns {Boundary} This boundary
 */
bd.extendBoundary = function(b) {
	if(b.top < this.top)
		this.top = b.top;
	
	if(b.right > this.right)
		this.right = b.right;
		
	if(b.bottom > this.bottom)
		this.bottom = b.bottom;
		
	if(b.left < this.left)
		this.left = b.left;
		
	this.width = this.right-this.left;
	this.height = this.bottom-this.top;
	this.center = { x: this.left+this.width/2, y: this.top+this.height/2 };
		
	return this;
};var PuzzleBox = PuzzleBox || {};

/**
 * Represents a container that holds Pieces
 *
 * @constructor
 * @augments createjs.Container
 * @param {Object} options Option overrides
 * @property {Array} _pieces - The pieces inside this container
 * @property {boolean} _selected - The selected status of this PieceContainer
 * @property {Puzzle} _puzzle - The puzzle that this PieceContainer belongs to
 * @property {Boundary} boundary - The boundary of this piece container
 */
PuzzleBox.PieceContainer = function(options) {
	
	this._pieces = options.pieces || new Array();
	this._selected = false;
	this._puzzle = null;
	this._snapped = false;
	this.boundary = new PuzzleBox.Boundary(9999, 9999, (2*-9999), (2*-9999));
	this.initialize(options);
	
};

var pc = PuzzleBox.PieceContainer.prototype = new createjs.Container();

pc.Container_initialize = pc.initialize;

// INITIALIZER
// --------------------

pc.initialize = function(options) {
	this.Container_initialize(options);
	
	// set parameters
	this.name = options.name || "container"+this.id;
	this.cursor = options.cursor || "move";
	this.x = options.x || 250;
	this.y = options.y || 250;
	this._selected = false;
	this._fixed = false;
	this.type = "piece-container";
	
	// should we fix the piece container?
	try {
		this._fixed = options.pieces[0].fixed;
		if(this._fixed)
			this.cursor = "arrow";
	} catch(err) {
		console.log(err);
		this._fixed = false;
	}
	
	if(!this._fixed) {
		this.alpha = 0.8;
	}
	
	for(var i=0; i < this._pieces.length; i++) {
		if(typeof(this._pieces[i].parent) == "undefined" 
			|| this._pieces[i].parent == null) {
			this._pieces[i].parent = this;
			if(this._pieces[i].parentX != 0 || this._pieces[i].parentY != 0) {
				this.x = this._pieces[i].parentX;
				this.y = this._pieces[i].parentY;
			}
		}
	}

	this.setBoundary();
	
};

// SETTERS
// --------------------

/**
 * Sets the boundary for the piece container.
 * @method PieceContainer..setBoundary
 * @returns {PieceContainer} This piece container
 **/
pc.setBoundary = function() {
	// our box: left, right, top, bottom
	var box = new PuzzleBox.Boundary(9999, 9999, (2*-9999), (2*-9999));
	
	// extend the boundary by each piece
	for(var i = 0; i < this._pieces.length; i++) {
		box.extendBoundary(this._pieces[i].getPieceBoundary());
	}

	// check and make sure this is a valid boundary
	if(box.width < 1 || box.height < 1)
		box = new PuzzleBox.Boundary(0, 0, 1, 1);
	
	var offSet = box.center;
	
	// update this boundary
	this.boundary = box;
	this.boundary.top += this.y-offSet.y;
	this.boundary.left += this.x-offSet.x;
	this.boundary.bottom += this.y-offSet.y;
	this.boundary.right += this.x-offSet.x;
	return this;
};

/**
 * Sets the cache for the piece container. The cache puts the area 
 * specified in a separate canvas to conserve resources.
 * @method PieceContainer..setCache
 * @returns {PieceContainer} This piece container
 **/
pc.setCache = function() {
	var b = this.getPieceContainerBoundary();
	this.cache(b.left, b.top, b.width, b.height);
	return this;
};


// GETTERS
// --------------------

/**
 * Gets the pieces inside this piece container
 * @method PieceContainer.getPieces
 * @returns {Array} An array of pieces inside this container
 **/
pc.getPieces = function () {
  return this._pieces;
};

/**
 * Gets the pieces inside this piece container
 * @method PieceContainer.getPieces
 * @returns {Array} An array of pieces inside this container
 **/
pc.getPieceString = function () {
	var ps = "";
	if(this._pieces.length == 1)
		return this._pieces[0].displayName;
	for(var i = 0; i < this._pieces.length; i++) {
		if(i !== (this._pieces.length-1))
  		ps += this._pieces[i].displayName + ", ";
  	else 
  		ps += this._pieces[i].displayName;
  }
  return ps;
};

/**
 * Gets the bounding box of this piece container relative to the stage
 * @method PieceContainer.getBoundingBox
 * @returns {Boundary} The boundary relative to the stage
 **/
pc.getBoundingBox = function() {
	return this.boundary;
};

/**
 * Gets the boundary of this piece container relative to the center point
 * @method PieceContainer.getPieceContainerBoundary
 * @returns {Boundary} The boundary relative to the center point
 **/
pc.getPieceContainerBoundary = function() {
	return new PuzzleBox.Boundary(
		this.boundary.left-this.x+this.boundary.center.x, 
		this.boundary.top-this.y+this.boundary.center.y,
		this.boundary.width,
		this.boundary.height
	);
};

// METHODS
// --------------------
	
/**
 * Adds a piece to the piece container 
 * @method PieceContainer.addPiece
 * @param {Piece} p Piece to add to the container
 * @returns {PieceContainer} This piece container
 **/
pc.addPiece = function (p) {
  this._pieces.push(p);
  p.parent = this;
  
  // update this container boundary
  this.setBoundary();
  
  // save the old reg point
  var oldReg = { x: this.regX, y: this.regY };
  
  // set the new reg point to the center of the bounding box
  this.regX = this.boundary.getCenter().x;
  this.regY = this.boundary.getCenter().y;
  
  // determine the reg point difference and set position
  var regDiff = { x: this.regX-oldReg.x, y: this.regY-oldReg.y };
  this.x += regDiff.x;
  this.y += regDiff.y;
  
  // notify that a piece has been added
  this._puzzle.pieceAdded.notify({ piece : p });
  return this;
};

/**
 * Sets the position of the piece container
 * @method PieceContainer.movePiece
 * @param {int} x The x position to move the piece container to
 * @param {int} y The y position to move the piece container to
 * @returns {PieceContainer} This piece container
 **/
pc.movePiece = function(x,y) {
	// set the position
	this.x = x;
	this.y = y;
	
	// update the boundary if we're not snapped
	if(!this._snapped) {
		this.boundary.top = this.y-this.boundary.height/2;
		this.boundary.left = this.x-this.boundary.width/2;
		this.boundary.bottom = this.y+this.boundary.height/2;
		this.boundary.right = this.x+this.boundary.width/2;
	}
	return this;
};

/**
 * Sets the rotation of the piece container
 * @method PieceContainer.rotatePiece
 * @param {Event} The rotate handle drag event
 * @returns {PieceContainer} This piece container
 **/
pc.rotatePiece = function(e) {
	this.rotation = e.start + ((e.stageX-e.offset.x)+(e.stageY-e.offset.y));
	return this;
};

/**
 * Removes a piece from the container
 * @method PieceContainer.removePiece
 * @param {Piece} p The piece to remove from the container
 * @returns {boolean} true or false depending on if the piece was removed
 **/
pc.removePiece = function (p) {
	for(var i = 0; i < this._pieces.length; i++) {
		if(this._pieces[i].id == p.id)
		{
			this._pieces.remove(i);
			this._puzzle.pieceRemoved.notify({ piece : p });
			return true;
		}
	}
	this.setBoundary();
	return false;
};

/**
 * Adds selected treatments to this PieceContainer
 * @method PieceContainer.selectPiece
 * @returns {PieceContainer} This piece container
 **/
pc.selectPiece = function() {
	this._selected = true;
	this.parent.addChild(this);
	//this.filters = [new createjs.ColorFilter(1, 1, 0.6, 1)];
	for(var i = 0; i < this._pieces.length; i++) {
		this._pieces[i].image = this._pieces[i].imgSelected;
	}
	return this;
};

/**
 * Sets a hover filter on the piece container
 * @method PieceContainer.hoverPiece
 * @returns {PieceContainer} This piece container
 **/
pc.hoverPiece = function() {
	if(!this._selected) {
		//this.filters = [new createjs.ColorFilter(0.8, 1, 0.8, 1)];
		for(var i = 0; i < this._pieces.length; i++) {
			this._pieces[i].image = this._pieces[i].imgHover;
		}
	}
	return this;
};

/**
 * Removes the filters and selected status from a piece if forced.
 * @method PieceContainer.resetPiece
 * @param {boolean} force Set to true if resetting selected piece
 * @returns {PieceContainer} this piece container
 **/
pc.resetPiece = function(force) {
	force = typeof force !== 'undefined' ? force : false;
	if(!this._selected || force) {
		this._selected = false;
		//this.filters = [];
		for(var i = 0; i < this._pieces.length; i++) {
			this._pieces[i].image = this._pieces[i].imgNeutral;
		}
	}
	return this;
};

/**
 * Goes through all of the pieces in the container and checks if any 
 * of them are matched with their pair. If there are any matches, the 
 * pieces are connected.
 * @method PieceContainer.matchPieces
 * @return {PieceContainer} This piece container
 **/
pc.matchPieces = function() {
	for(var i = 0; i < this._pieces.length; i++) {
		var matches = this._pieces[i].getMatches();
		// there might be more than one match, but we only want to make one at a time
		for(var j = 0; j < matches.length; j++) {
			// if both pieces are in the same piece container, don't connect them
			if(matches[j].getPiece().parent.id !== matches[j].getMatch().getPiece().parent.id) {
				this._puzzle.connectPointWithMatch(matches[j]);
			} else {
				// they're already matched, remove this
				matches[j].getPiece().removePoint(matches[j]);
				matches[j].getMatch().getPiece().removePoint(matches[j].getMatch());
			}
			debug.log(matches[j], "Match has been made");
		}
	}

	return this;
};

pc.snapPiece = function() {
	if(this.isMatched) {
		this.resetPiece(true);
		if(this._snapped && this._puzzle._options.soundEnabled)
			createjs.Sound.play("snap").setVolume(0.25); 
	}
		
	return this;
};

pc.isMatched = function() {
	var matches = false;
	for(var i = 0; i < this._pieces.length; i++) {
		if(this._pieces[i].getMatches().length > 0)
			matches = true;
	}
	return matches;
};

/** 
 * Checks if the current piece container is within the radius of any matches,
 * and if it is, the piece container will "snap" to its matched position.
 * @method PieceContainer.snapToMatch
 * @return {PieceContainer} This piece container
 **/
pc.snapToMatch = function() {
	this._snapped = false;
	for(var i = 0; i < this._pieces.length; i++) {
		var matches = this._pieces[i].getMatches();
		if(matches.length > 0) {	// we're only gonna snap to one
			var m = matches[0];
			
			var offsets = [
				m.getStageOffset(), 
				m.getMatch().getStageOffset()
			];
			var difference = { 
				x: 	offsets[0].x-offsets[1].x,
				y: 	offsets[0].y-offsets[1].y
			};
			this.set({
				x: this.x-difference.x, 
				y: this.y-difference.y
			});
			this._snapped = true;
			this.boundary.top = this.y-this.boundary.height/2;
			this.boundary.left = this.x-this.boundary.width/2;
			this.boundary.bottom = this.y+this.boundary.height/2;
			this.boundary.right = this.x+this.boundary.width/2;
		}
	}
	return this;
};

/**
 * Determines if this Piece Container is currently selected.
 * @method PieceContainer.isSelected
 * @return {boolean} True if this piece is selected, false if not
 **/	
pc.isSelected = function() {
	return this._selected;
};

pc.isFixed = function() {
	return this._fixed;
};

/**
 * Goes through every point of every piece within this piece container 
 * and sets the angle, radius, and offset for the point.
 * @method PieceContainer.updatePoints
 * @return {PieceContainer} This piece container
 **/
pc.updatePoints = function() {
	for(var i = 0; i < this._pieces.length; i++) {
		for(var j = 0; j < this._pieces[i]._points.length; j++) {
			this._pieces[i]._points[j].updatePoint();
		}
	}
	return this;
};

/**
 * Goes through every point of every piece within this piece container 
 * and sets the offset of the point. Does not adjust the angle/radius 
 * of the point like updatePoints().
 * @method PieceContainer.updatePointsOffset
 * @return {PieceContainer} This piece container
 **/
pc.updatePointsOffset = function() {
	for(var i = 0; i < this._pieces.length; i++) {
		for(var j = 0; j < this._pieces[i]._points.length; j++) {
			this._pieces[i]._points[j].setOffset();
		}
	}
	return this;
};

/**
 * Goes through all the pieces in this piece container and sorts them 
 * based on the value of their z-index.
 * @method PieceContainer.sortPieces
 * @return {PieceContainer} This piece container
 **/
pc.sortPieces = function() {

	this._pieces.sort(function(a,b) {
		if(a.zindex < b.zindex)
			return -1;
		if(a.zindex > b.zindex)
			return 1;
		return 0;
	});
	
};


/**
 * Get a string representation of the PieceContainer
 * @override
 * @method PieceContainer.toString
 * @this {PieceContainer}
 * @returns {string} Human-readable representation of this PieceContainer.
 */
pc.toString = function() {
	var b = this.boundary;
	var pcString = this.name + "\n"
		+ "Position: " + this.x + "," + this.y + "\n"
		+ "Rotation:" + this.rotation + "\n"
		+ "Centre:" + this.regX + "," + this.regY + "\n"
		+ "Dimensions: " + b.width + "," + b.height + "\n" 
		+ "Boundary: " + (b.left) + "," + (b.top) + " : " 
			+ (b.right) + "," + (b.bottom) + "\n";
	for(var i = 0; i < this._pieces.length; i++) {
		pcString += this._pieces[i].toString();
	}
	return pcString;
};

/**
 * Get an html string representation of the PieceContainer
 * @method PieceContainer..toHTMLString
 * @this {PieceContainer}
 * @returns {string} HTML representation of this PieceContainer.
 */
pc.toHTMLString = function() {
	var pcString = "<h3>" + this.name + "</h3>"
		+ "<ul class='properties'>" 
		+ "<li><span>Position: </span>" + this.x + "," + this.y + "</li>"
		+ "<li><span>Rotation:</span>" + this.rotation + "</li>"
		+ "<li><span>Centre: </span>" + this.regX + "," + this.regY + "</li>"
		+ "<li><span>Dimensions: </span>" + this.boundary.width + "," 
		+ this.boundary.height + "</li>" + "<li><span>Boundaries: </span>" 
		+ (this.boundary.left) + "," + (this.boundary.top) + " : " 
		+ (this.boundary.right) + "," + (this.boundary.bottom) + "<li>";
	for(var i = 0; i < this._pieces.length; i++) {
		pcString += this._pieces[i].toHTMLString();
	}
	pcString += "</li></ul>";
		
	return pcString;
};
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

	this.snapRadius = options.snapRadius || 50;
	
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

	_this.mouseEnabled = true;

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

	// MAGIC: NEEDS REAL FIX
	// this mysteriously fixes the mousedown issue
	this.on("mousedown", function() { });

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
};var PuzzleBox = PuzzleBox || {};

/** 
 * Represents a 2D puzzle element. 
 *
 * @constructor
 * @param {Array} pieceContainers - The piece containers for the puzzle
 * @property {Array} _pieceContainers - The piece containers inside the puzzle
 * @property {Piece} _selectedPiece - The currently selected piece
 * @property {createjs.Bitmap} _hint - An image overlay of the completed puzzle
 * @property {createjs.Bitmap} _background - An image to use for the background of the puzzle
 * @property {Piece} _selectedPiece - The currently selected piece
 * @property {Event} pieceContainerAdded - Fired right after a new PieceContainer is pushed on _pieceContainers
 * @property {Event} pieceContainerRemoved - Fired right after a PieceContainer is removed from _pieceContainers
 * @property {Event} selectedPieceChanged - Fired when _selectedPiece changes
 * @property {Event} pointsConnected - Fired when two PieceContainers have been connected at a Point
 * @property {Event} pieceAdded - Fired when a piece is added to a piece container
 * @property {Event} pieceRemoved - Fired when a piece is removed from a piece container
 * @property {Event} puzzleComplete - Fired when the puzzle is done
 */
PuzzleBox.Puzzle = function(data) {

	this.id = data.id || 'puzzleRoot';
	this._pieceContainers = new Array();
	this._pieces = new Array();
	this._selectedPiece = null;
	this._hint = null;
	this._data = data || { };
	this._background = null;
	this._queue = new createjs.LoadQueue();	
	this._View = null;
	this._Controller = null;
	this._options = {
		allowRotate: true,
		allowHint: true,
		showLabels: true,
		snapAll: false,
		snapRadius: 50,
		showTitle: true,
		soundEnabled: true
	};

	if (typeof data.options == 'object') {
		this._options = $.extend(this._options, data.options);
	}
	
	
	this.pieceContainerAdded = new PuzzleBox.Event(this);
	this.pieceContainerRemoved = new PuzzleBox.Event(this);
	this.selectedPieceChanged = new PuzzleBox.Event(this);
	this.pointsConnected = new PuzzleBox.Event(this);
	this.pieceAdded = new PuzzleBox.Event(this);
	this.pieceRemoved = new PuzzleBox.Event(this);
	this.puzzleComplete = new PuzzleBox.Event(this);
	this.backgroundSet = new PuzzleBox.Event(this);
	this.puzzleLoaded = new PuzzleBox.Event(this);
	this.fileLoaded = new PuzzleBox.Event(this);
	this.progressChange = new PuzzleBox.Event(this);
	
	this.initialize();

};

var pz = PuzzleBox.Puzzle.prototype;

pz.initialize = function() { 

	var majorVersion, verOffset,ix;

	$('body').addClass(this._data.id);
	
	// Install the sound plugin
	if(this._options.soundEnabled) {
		this._queue.installPlugin(createjs.Sound);
		createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
	}

	var _pzl = this;

	// Setup the loading listeners
	this._queue.addEventListener("complete", function(event) { 

		_pzl.puzzleLoaded.notify({ 
			event: event
		});
	});
	
	this._queue.addEventListener("fileload", function(evt) { 
		_pzl.fileLoaded.notify({ 
			event: evt
		});
	});
	
	this._queue.addEventListener("progress", function(evt) { 
		_pzl.progressChange.notify({ 
			event: evt
		});
	});



	this._View = new PuzzleBox.PuzzleView(this);

	this._View.showLoadingWindow(
		this._data.title, 
		this._data.instructionText,
		this._data.instructionGif,
		this._data.instructionMouse
	);
	this._Controller = new PuzzleBox.PuzzleController(this, this._View);
	this.loadPuzzle();
};

pz.loadPuzzle = function() {

	var pzl = this._data;

	// Load background
	this._queue.loadManifest(pzl.background);

	// Load the hint image
	this._queue.loadManifest(pzl.hint);

	var pieceManifest = (function(pcs) {
		var manifest = [];
		for(var i=0; i < pcs.length; i++) {
			pcs[i].state = 'neutral';
			manifest.push(pcs[i]);
			if(pcs[i].hover !== null)
				manifest.push({ id: pcs[i].id+"-hover", src: pcs[i].hover, state: 'hover' });
			if(pcs[i].selected !== null)
				manifest.push({ id: pcs[i].id+"-selected", src: pcs[i].selected, state: 'selected' });
		}
		return manifest;
	})(pzl.pieces);

	// Load the pieces
	this._queue.loadManifest(pieceManifest);

	// Load the sounds
	if(this._options.soundEnabled) {
		for(var i=0; i < pzl.sounds.length; i++) {
			var s = pzl.sounds[i];		
			// createjs 0.7 sound loading
			createjs.Sound.alternateExtensions = ["ogg"];
			createjs.Sound.registerSound(s.mp3, s.id);
			// createjs 0.4 sound loading
			// this._queue.loadFile({id: s.id, src: s.mp3+"|"+s.ogg });
		}		
	}
};

pz.setupPuzzle = function() {

	// Set the puzzle width and height
	var bg = this._queue.getResult('background');
	
	// Set the puzzle background
	this.setBackground(bg);
	
	// Set the puzzle hint
	if(this._options.allowHint){
		this.setHint(this._queue.getResult('hint'));
		this._View.enableHintButton();
	}

	if(this._options.snapAll) {
		this._View.enableValidateButton();
	}
		

	// Add all the pieces in random spots
	while((p=this._pieces.pop()) != null) {	
		p.imgNeutral = this._queue.getResult(p.name);
		p.imgHover = this._queue.getResult(p.name+'-hover');
		p.imgSelected = this._queue.getResult(p.name+'-selected');
	
		var options = {};
		var bgSize = this.getBackgroundSize();
		options.pieces = [p];
		if(typeof(this._options.placementBox) === "object" && !p.fixed)
		{
			var b = this._options.placementBox;
			options.x = b.x+p.regX+Math.round(Math.random()*(b.width-p.image.width));
			options.y = b.y+p.regY+Math.round(Math.random()*(b.height-p.image.height));
		}
		else 
		{
			options.x = p.regX+Math.round(Math.random()*(this._View.getCanvas().width-p.image.width));
			options.y = p.regY+Math.round(Math.random()*(this._View.getCanvas().height-p.image.height));	
		}


		var pc1 = new PuzzleBox.PieceContainer(options);
		this.addPieceContainer(pc1);
	}
	
	var pzl = this._data;
	
	// If you can snap to any point, setup the success state
	if(this._options.snapAll) {
		// setup matches to snap to
		for(var i = 0; i < pzl.matches.length; i++) {
			for(var j = 0; j < pzl.pieces.length; j++) {
				var newPoint = new PuzzleBox.Point(
					this.getPieceByName(pzl.matches[i].piece),
					pzl.matches[i].x,
					pzl.matches[i].y
				);
				newPoint.setMatch(new PuzzleBox.Point(this.getPieceByName(pzl.pieces[j].id),0,0));
			}
		}
		// build the success state for the puzzle
		var successState = new Array();
		for(var i = 0; i < pzl.success.length; i++) {
			var piece1 = this.getPieceByName(pzl.success[i][0].piece);
			var piece2 = this.getPieceByName(pzl.success[i][1].piece);
			// todo: account for piece1 offset
			var successCondition = {
				id: piece1.name,
				x: piece2.boundary.width/2+pzl.success[i][1].x, 
				y: piece2.boundary.height/2+pzl.success[i][1].y, 
			};
			successState.push(successCondition);
		} 
		this.setSuccessState(successState);

	// Pieces only snap to their match
	} else {
		for(var i = 0; i < pzl.matches.length; i++) {
			var newPoint = new PuzzleBox.Point(
				this.getPieceByName(pzl.matches[i][0].piece),
				pzl.matches[i][0].x,
				pzl.matches[i][0].y
			);
			newPoint.setMatch(new PuzzleBox.Point(
				this.getPieceByName(pzl.matches[i][1].piece),
				pzl.matches[i][1].x,
				pzl.matches[i][1].y
			));
		}
	}

	// notify that the puzzle is ready
	this.puzzleLoaded.notify({
		event: { name: "Puzzle Loaded" }
	});

};


// GETTERS
// ----------------------------

/**
 * Gets the piece containers for the puzzle
 * @method Puzzle.getPieceContainers
 * @returns {Array} The piece containers for this puzzle
 */	
pz.getPieceContainers = function () {
	return this._pieceContainers;
};

/**
 * Gets a puzzle piece by name
 * @method Puzzle.getPieceByName
 * @returns {Piece|Boolean} The piece with the provided name, or false if it is not found
 */	
pz.getPieceByName = function(name) {
	for(var i = 0; i < this._pieceContainers.length; i++) {
		for(var j = 0; j < this._pieceContainers[i]._pieces.length; j++) {
			if(this._pieceContainers[i]._pieces[j].name == name) {
				return this._pieceContainers[i]._pieces[j];
			}
		}
	}
	return false;
};

pz.getContainerByPieceName = function(name) {
	for(var i = 0; i < this._pieceContainers.length; i++) {
		for(var j = 0; j < this._pieceContainers[i]._pieces.length; j++) {
			if(this._pieceContainers[i]._pieces[j].name == name) {
				return this._pieceContainers[i];
			}
		}
	}
	return false;
};

/**
 * Gets the selected puzzle PieceContainer
 * @method Puzzle.getSelectedPiece
 * @returns {PieceContainer} The selected PieceContainer
 */
pz.getSelectedPiece = function () {
	return this._selectedPiece;
};

/**
 * Get puzzle background size
 * @method Puzzle.getBackgroundSize
 * @returns {Object} Width and height of the background
 */
pz.getBackgroundSize = function () {
	return { 
		width: 	this._background.image.width, 
		height: this._background.image.width 
	}
};

// SETTERS
// ----------------------------

/**
 * Sets the piece container as the selected piece
 * @method Puzzle.setSelectedPiece
 * @param {PieceContainer} pc The piece container to select
 */
pz.setSelectedPiece = function (pc) {
	var oldPiece = this._selectedPiece;
	
	if(oldPiece !== null)
		oldPiece.resetPiece(true);
	
  this._selectedPiece = pc;
  if(pc !== null)
  	this._selectedPiece.selectPiece();
  	
  this.selectedPieceChanged.notify({ 
  	oldPiece : oldPiece,
  	newPiece : this._selectedPiece,
  	event :  {
  		type : "selectchange"
  	}
  });
};

/**
 * Sets the background image for the puzzle
 * @method Puzzle.setBackground
 * @param {Image} bg The image object to use for the background
 */
pz.setBackground = function(bg) {
	this._background = new createjs.Bitmap(bg);
	this._background.type = "background";
	this.backgroundSet.notify({
		bg : this._background,
		event : {
			type : "backgroundset"
		}
	});
	return this;
};

/**
 * Sets the hint for the puzzle
 * @method Puzzle.setHint
 * @param {Image} hint The hint image containing the completed puzzle
 */
pz.setHint = function(hint) {
	this._hint = new createjs.Bitmap(hint);
	this._hint.alpha=0;
	this._hint.type = "hint";
	return this;
};

pz.setSuccessState = function(success) {
	this._successState = success;
	return this;
};



// FUNCTIONS
// ----------------------------

/**
 * Adds a piece container to the puzzle
 * @method Puzzle.addPieceContainer
 * @param {PieceContainer} pc The piece container to add to the puzzle
 */
pz.addPieceContainer = function (pc) {
  this._pieceContainers.push(pc);
  pc._puzzle = this;
  this.pieceContainerAdded.notify({ 
  	pieceContainer : pc, 
  	event :  {
  		type : "addpiececontainer"
  	}
  });
};

/**
 * Removes a piece container from the puzzle
 * @method Puzzle.removePieceContainer
 * @param {PieceContainer} pc The piece container to remove to the puzzle
 * @returns {boolean} True if the piece is removed, false if it is not
 */
pz.removePieceContainer = function (pc) {
	for(var i = 0; i < this._pieceContainers.length; i++) {
		if(this._pieceContainers[i].id == pc.id)
		{
			this._pieceContainers.remove(i);
			if(pc.isSelected()) {
				this._selectedPiece = null;
			}
			this.pieceContainerRemoved.notify({ 
				pieceContainer : pc, 
				event :  {
					type : "removepiececontainer"
				}
			});
			return true;
		}
	}
	return false;
};

/**
 * Connects two pieces at the point passed to the function
 * @method Puzzle.connectPointWithMatch
 * @param {Point} pt The point to connect
 * @returns {Puzzle} this puzzle
 */	
pz.connectPointWithMatch = function(pt) {
	
	var staticPoint = pt.getMatch();
	var movedPoint = pt;
	
	// merge the piece containers
	this.mergePieceContainers(
		movedPoint.getPiece().getParentPieceContainer(), 
		staticPoint.getPiece().getParentPieceContainer(),
		pt.getMatch()
	);
	
	// remove the matched points from the pieces
	movedPoint.getPiece().removePoint(movedPoint);
	staticPoint.getPiece().removePoint(staticPoint);
	pt = null;
	
	// deselect the snapped piece container
	movedPoint.getPiece().getParentPieceContainer().resetPiece(true);
	
	// let the puzzle know that we connected two points	
	this.pointsConnected.notify({ 
		pieceContainer: movedPoint.getPiece().getParentPieceContainer(), 
		event :  {
			type : "pointsconnected"
		}
	});
	
	// check if the puzzle is finished
	if(this.isComplete())
	{
		this.puzzleComplete.notify({ 
			pieceContainer: movedPoint.getPiece().getParentPieceContainer(), 
			event :  {
				type : "puzzlecomplete"
			}
		});
	}
	
	return movedPoint.piece.getParentPieceContainer();
		
};

/**
 * Takes the pieces from one piece container and moves them into another
 * piece container
 * @method Puzzle.connectPointWithMatch
 * @param {PieceContainer} from The piece container to move from
 * @param {PieceContainer} to The piece container to move to
 * @param {Point} connectPoint The point to merge to
 */	
pz.mergePieceContainers = function(from, to, connectPoint) {

	var fromPieces = from.getPieces();
	var pc = null;
	
	// calculate the difference so the pieces are placed correctly when moved
	var difference = { 
		x: 	(connectPoint.x+connectPoint.piece.x)
				-(connectPoint.getMatch().x+connectPoint.getMatch().piece.x),
		y: 	(connectPoint.y+connectPoint.piece.y)
				-(connectPoint.getMatch().y+connectPoint.getMatch().piece.y)
	};
	
	// pop off each piece and move it to the piece container
	while((pc=fromPieces.pop()) != null) {	
		pc.set({
			x: difference.x+pc.x, 
			y: difference.y+pc.y
		});
		pc.setBoundary();
		to.addPiece(pc);
		to.setBoundary();
		from.removePiece(pc);
	}
	
	// clean up the stage by removing the empty piece container
	this.removePieceContainer(from);
	
	return this;
	
};

/**
 * Removes selected status from the selected piece
 * @method Puzzle.deselectPieces
 * @returns {Puzzle} This puzzle
 */	
pz.deselectPieces = function() {
	if(this._selectedPiece !== null) {
		this._selectedPiece.resetPiece(true);
		var oldPiece = this._selectedPiece;
		this._selectedPiece = null;
		// let the puzzle know the selected piece has changed
		this.selectedPieceChanged.notify({ 
			oldPiece : oldPiece,
			event :  {
				type : "selectchange"
			}
		});
	}
	return this;
};

pz.isInSuccessState = function() {
	var threshold = 0;
	if(typeof this._successState === "undefined")
		return false;

	for(var i = 0; i < this._successState.length; i++) {
		var sc = this._successState[i];
		var pc = this.getContainerByPieceName(sc.id);
		threshold += Math.abs(sc.x-pc.x);
		threshold += Math.abs(sc.y-pc.y);
	}

	if(threshold > 20)
		return false;
	
	return true;
};

/**
 * Checks to see if the puzzle is in a complete state
 * @method Puzzle.isComplete
 * @returns {boolean} true if the puzzle is complete, false if not
 */	
pz.isComplete = function() {
	if(this._pieceContainers.length == 1)
		return true;
	return false;
};
	
pz.toString = function() {
	var puzzleString = "<ul>";
		
	if(this._selectedPiece !== null) {
		puzzleString += "<li class='selected-piece'>" + 
				this._selectedPiece.toString() + 
			"</li>";
	} else {
		puzzleString += "<li class='no-pieces'>No pieces have been selected.</li>";
	}
	
	puzzleString += "</ul>";
	/*
	puzzleString += "<li class='piece-containers'><h2>All Piece Containers</h2> "
	for(var i = 0; i < this._pieceContainers.length; i++) {
		puzzleString += this._pieceContainers[i].toString();
	}
	puzzleString += "</li></ul>";
	*/
	return puzzleString;
};var PuzzleBox = PuzzleBox || {};

/**
 * The PuzzleView contains the stage and does any of the actual rendering 
 * to the canvas. The view also handles user interaction and notifies the 
 * controller when events take place.
 *
 * @constructor
 * @param {Puzzle} options Option overrides
 * @property {DOMElement} _canvas - HTML Canvas Element the puzzle is rendered to
 * @property {createjs.Stage} _stage - Stage that contains the puzzle
 * @property {boolean} _animating - Set to true when animation is happening on the stage
 * @property {number} _aspectRatio - The aspect ratio (width/height) of the puzzle, used for resizing
 * @property {Puzzle} _model - The puzzle object
 * @property {Event} clickedOnPiece - Event that occurs when the user clicks on a piece
 * @property {Event} clickedOnNothing - Event that occurs when the user clicks on nothing
 * @property {Event} mouseOverPiece - Event that occurs when the mouse goes over a piece
 * @property {Event} mouseOutPiece - Event that occurs when the mouse leaves a piece
 * @property {Event} dragPiece - Event that occurs when the user drags a piece
 * @property {Event} dragRotateHandle - Event that occurs when the user drags the rotate handle
 * @property {Event} releasePiece - Event that occurs when the user releases a piece after dragging
 */
PuzzleBox.PuzzleView = function(model) {

	if(typeof(canvas) == 'undefined') {
		var canvas = document.getElementById('puzzleCanvas');
		if(canvas == null) {
			canvas = document.createElement("canvas");
			canvas.id = "puzzleCanvas";
			document.getElementsByTagName('body')[0].appendChild(canvas);
		}
	}

	createjs.Ticker.setPaused(true); 

	this._canvas = canvas;
	this._animating = false;
	this._aspectRatio = 16/9;
	this._model = model;
	this._stage = new createjs.Stage(this._canvas);
	this.clickedOnPiece = new PuzzleBox.Event(this);
	this.clickedOnNothing = new PuzzleBox.Event(this);
	this.mouseOverPiece = new PuzzleBox.Event(this);
	this.mouseOutPiece = new PuzzleBox.Event(this);
	this.dragPiece = new PuzzleBox.Event(this);
	this.dragRotateHandle = new PuzzleBox.Event(this);
	this.releasePiece = new PuzzleBox.Event(this);
	this.clickStartButton = new PuzzleBox.Event(this);
	this.validationRequested = new PuzzleBox.Event(this);

	this.Components = {
		pieceLabel : $('#piece-label'),
		hintToggle : $('#hint-toggle'),
		validateButton : $('#validate-btn'),
		progressBar : $('#progress-bar'),
		startButton : $('#start'),
		loadingLabel : $('#loading-label'),
		canvasHolder : $('#fullscreen'),
		loadingWindow : $('#loading-window'),
		loadingTitle : $('#puzzle-title'),
		loadingGif : $('#puzzle-gif'),
		loadingIntro : $('#puzzle-intro'),
		loadingGestures : $('#puzzle-gestures'),
		notifyWindow : $('#ntfy-window'),
		notifyTitle : $('#ntfy-title'),
		notifyMessage : $('#ntfy-message'),
		notifyClose : $('#ntfy-close')
	};

	var _this = this;

		// start button
	this.Components.startButton.bind("click", function(e) {
		_this.initialize();
		_this.clickStartButton.notify({
			event : e
		});
	});
};

var pv = PuzzleBox.PuzzleView.prototype;

pv.initialize = function() {
	this._stage._needsUpdate = false;
	
	this._stage.mouseEnabled = true;
	this._stage.enableMouseOver(30);
	this._stage.mouseMoveOutside = true;
	
	this._hoveredPiece = null;
	
	var _this = this;
	
	createjs.Touch.enable(this._stage);
	createjs.Ticker.setPaused(false); 
	
	// get rid of text cursor on drag
	document.onselectstart = function(){ return false; }
	
	this._stage.addEventListener("stagemousemove", function(event) {
		//console.log(event);
		var ob = _this._stage.getObjectUnderPoint(event.stageX/_this._stage.scaleX, event.stageY/_this._stage.scaleY);
		if(ob == null)
			ob = {type:"background"}
		
		if(ob.type !== "background" && ob.type !== "hint") {
			if(ob.type=="piece")
				ob = ob.parent;
				
			if(_this._hoveredPiece == null && !ob.isFixed()) {
				_this._hoveredPiece = ob;
				document.body.style.cursor='pointer';
				_this.mouseOverPiece.notify({ 
					event: event, 
					pieceContainer: ob
				});
			}
				
		} else {
			if(_this._hoveredPiece !== null) {
				var tmppc = _this._hoveredPiece;
				if(_this._model.getSelectedPiece() !== null && _this._model._options.allowRotate) {
					document.body.style.cursor='url(https://d396qusza40orc.cloudfront.net/dino101%2Fpuzzle%2Fassets%2Fcommon%2Frotate3.cur),default';
				} else {
					document.body.style.cursor='default';
				}
				_this.mouseOutPiece.notify({ 
					event: event, 
					pieceContainer: tmppc
				});
				_this._hoveredPiece = null;
			}
		}
	});
	
	// attach listeners to stage events
	
	// Double click fires "clickedOnNothing", which deselects the currently selected piece
	this._stage.addEventListener("dblclick", function(event) {
		var ob = _this._stage.getObjectUnderPoint(event.stageX/_this._stage.scaleX, event.stageY/_this._stage.scaleY);
		if(ob.type == "background" || ob.type == "hint") {
			_this.clickedOnNothing.notify({ event: event });
			document.body.style.cursor='default';
		}
	});
	
	// Mouse down fires "clickedOnPiece" if a piece was selected
	this._stage.addEventListener("mousedown", function(event) {
		var pc, offset;
		var startTime = new Date().getTime();
		var stage = _this._stage;
		var ob = stage.getObjectUnderPoint(stage.mouseX/stage.scaleX, stage.mouseY/stage.scaleY);
			
			// if no pieces were clicked
			if(ob == null) {

				// if it's a quick click on nothing, deselect
				event.addEventListener("mouseup", function(evt) {
					var endTime = new Date().getTime();
					if((endTime - startTime) < 250) {
						_this.clickedOnNothing.notify({ event: evt });
						document.body.style.cursor='default';
					}
				});
				
				var spc = _this._model.getSelectedPiece();
				if(spc !== null && _this._model._options.allowRotate) {
					var start = spc.rotation;
					offset = {x:event.stageX/stage.scaleX, y:event.stageY/stage.scaleY};
					
					// Mouse move when the user has moused down on an empty area causes rotation
					event.addEventListener("mousemove", function(evt) {
						evt.offset = offset;
						evt.start = start;
						evt.stageX = evt.stageX/stage.scaleX;
						evt.stageY = evt.stageY/stage.scaleY;
						_this.dragRotateHandle.notify({ 
							event: evt, 
							pieceContainer: spc
						});
					});
				}
				
			} else {

				pc = ob.parent;
			 	offset = {
					x:(pc.x-(event.stageX/stage.scaleX)), 
					y:(pc.y-(event.stageY/stage.scaleY))
				};
				_this.clickedOnPiece.notify({event : event, piece : ob });
				
				// if the user pressed down on a piece
				if(ob.type !== null) {
					if(ob.type == "piece" && !ob.parent.isFixed()) {
						// Mouse move when the user moused down on a piece causes movement
						event.addEventListener("mousemove", function(evt) {
							evt.offset = offset;
							document.body.style.cursor='move';
							evt.stageX = evt.stageX/stage.scaleX;
							evt.stageY = evt.stageY/stage.scaleY;
							_this.dragPiece.notify({ 
								event: evt, 
								pieceContainer: pc
							});
						});
					}
				}
				
				// check if any pieces match once the user lets go
				event.addEventListener("mouseup", function(evt) {
					document.body.style.cursor='pointer';
					_this.releasePiece.notify({ 
						event: evt, 
						pieceContainer: pc
					});
				});
				
			}
	});
	
	createjs.Ticker.setFPS(24);
	createjs.Ticker.addEventListener("tick", this.update.bind(this));
	
	// lets not let this run when no one is here
	window.onblur = function() { 
		createjs.Ticker.setPaused(true); 
		createjs.Ticker.removeEventListener("tick", _this.update.bind(_this));
	}
	window.onfocus = function() { 
		createjs.Ticker.setPaused(false);
		createjs.Ticker.addEventListener("tick", _this.update.bind(_this));
	}

	// hint button
	this.Components.hintToggle.bind("click", function(e) {
		_this.showHint();
	});

	// submit button
	this.Components.validateButton.bind("click", function(e) {
		_this.validationRequested.notify({
			event : e
		});
	});

	// close notification window button
	this.Components.notifyClose.bind("click", function(e) {
		_this.dismissNotification(_this.Components.notifyWindow);
	});

};

pv.getStage = function() {
	return this._stage;
};

pv.getCanvas = function() {
	return this._canvas;
};

/**
 * Gets the aspect ratio of the puzzle
 * @method PuzzleView.getAspectRatio
 * @returns {number} The decimal representation of the aspect ratio
 */
pv.getAspectRatio = function() {
	return this._aspectRatio;
};

/**
 * Sets the aspect ratio of the puzzle
 * @method PuzzleView.setAspectRatio
 * @param {number} ratio The decimal value of the ratio (width/height)
 */
pv.setAspectRatio = function(ratio) {
	this._aspectRatio = ratio;
};

pv.updateProgressBar = function(amount) {
	this.Components.progressBar.css('width', amount+'%');
};

pv.enableStartButton = function() {
	this.Components.startButton.text("Start");
	this.Components.startButton.attr('class', "btn btn-start");
};

pv.update = function (event) {
	if(!createjs.Ticker.getPaused()) {
	  if(this._stage._needsUpdate || this._animating) {
	  	this._stage._needsUpdate = false;
	  	this._stage.update(event);
	  }
  }
};
  
pv.triggerRefresh = function() {
	this._stage._needsUpdate = true;
};

pv.showPieceLabel = function(pc) {
	this.Components.pieceLabel.text(pc.getPieceString());
	this.Components.pieceLabel.attr("class", "active")
};

pv.hidePieceLabel = function() {
	this.Components.pieceLabel.attr('class', "inactive");
};

pv.showHintToggle = function() {
	this.Components.hintToggle.show();
};

pv.hideHintToggle = function() {
	this.Components.hintToggle.hide();
};

pv.addTitle = function(title) {
	this.Components.canvasHolder.append('<h1 id="overall-title" class="species-heading">' + title + '</h1>');
};

pv.showLoadingWindow = function(title, intro, instructionImg, gestureImg) {
	this.Components.loadingTitle.text(title);
	this.Components.loadingIntro.html(intro);
	for(var i = 0; i < instructionImg.length; i++) {
		$(".puzzle-gif-holder").append("<img src='"+instructionImg[i]+"' />")
	}
	if(instructionImg.length > 1) {
		// thanks snook
		$(function(){
    		$('.puzzle-gif-holder img:gt(0)').hide();
    		setInterval(function(){
      			$('.puzzle-gif-holder :first-child').fadeOut()
         		.next('img').fadeIn()
         		.end().appendTo('.puzzle-gif-holder');
         	}, 3000);
		});
	}
	//this.Components.loadingGif.attr('src', instructionGif);
	if(gestureImg)
		this.Components.loadingGestures.attr('src', gestureImg);
	else
		this.Components.loadingGestures.hide();
};

pv.hideLoadingWindow = function() {
	this.Components.canvasHolder.addClass("started");
	this.Components.loadingWindow.removeClass("active");
};
  
// using cache create a new canvas for each element,
// redefining the cache area is resource intensive,
// so only do it WHEN ABSOLUTELY NECESSARY.
pv.updatePieceContainer = function(pc) {
	var b = pc.getPieceContainerBoundary();
	if(!pc.cacheCanvas) {
		pc.cache(b.left, b.top, b.width, b.height);
	}
	else 
	{
		if(
				(b.left == pc._cacheOffsetX)
				&& (b.top == pc._cacheOffsetY)
				&& (b.width == pc.cacheCanvas.width)
				&& (b.height == pc.cacheCanvas.height)
			) {
				pc.updateCache();
			} else {
				pc.cache(b.left, b.top, b.width, b.height);
				debug.log("boundary doesn't match cache, updating");
			}
	}
	this._stage._needsUpdate = true;
};

pv.resizePuzzle = function(width, height) {

	if(typeof(this._stage.scaleX) === "undefined")
	{
		this._stage.scaleX = this._stage.scaleY = 1;
	}
	
	this._canvas.width = width;
	this._canvas.height = Math.round(width/this._aspectRatio);

	this.Components.canvasHolder.width(width+'px');
	this.Components.canvasHolder.height(Math.round(width/this._aspectRatio)+'px');

	// scale the puzzle to width / height
	var bgWidth = this._model._background.image.width;
	var scaleAmount = 1;
	if(bgWidth > 0)
		scaleAmount = this._canvas.width/bgWidth;
	
	this._stage.scaleX = this._stage.scaleY = this._stage.scale = scaleAmount;
	this._stage._needsUpdate = true;
};

pv.resizeHolder = function(width) {
	this.Components.canvasHolder.width(width+'px');
	this.Components.canvasHolder.height(Math.round(width/this._aspectRatio)+'px');
};
  
pv.removePieceContainers = function() {
	for(var i = 0; i < this._stage.children.length; i++) {
		var pc = this._stage.children[i];
		if(pc.type !== null) {
			if(pc.type == "piece-container")
				this._stage.removeChildAt(i);
		}
	}
};

pv.showHint = function() {
	var _this = this;
	if(!this._animating && this._model._options.allowHint) {
		this._animating = true;
		createjs.Tween.get(this._model._hint).to({alpha:0.25}, 500).wait(5000).call(_this.hideHint.bind(_this));
	}
};

pv.hideHint = function() {
	var _this = this;
	if(this._model._options.allowHint)
		createjs.Tween.get(this._model._hint).to({alpha:0}, 500).call(function() { _this._animating = false; });
};

pv.enableValidateButton = function() {
		this.Components.validateButton.removeClass('ctl-disabled');
};

pv.enableHintButton = function() {
	this.Components.hintToggle.removeClass('ctl-disabled');
};

pv.showBackground = function(bgurl) {
	this.Components.canvasHolder.css('background-image', 'url('+bgurl+')');
};

pv.notifySuccess = function() {
	this.showNotification('Correct!', 'You have successfully built the Dinosauria Tree.', 'success');
};

pv.notifyFail = function() {
	this.showNotification('Incorrect!', 'Not all the pieces are in their correct position on the Dinosauria Tree.', 'fail');
};

pv.showNotification = function(title, message, type) {
	this.Components.notifyTitle.text(title);
	this.Components.notifyMessage.text(message);
	this.Components.notifyWindow.attr('class',type + ' active');
	var topPos = (this.Components.canvasHolder.height()/2)-this.Components.notifyWindow.height()/2;
	this.Components.notifyWindow.css('top', topPos+'px')
};

pv.dismissNotification = function(element) {
	element.removeAttr('style');
	element.removeClass('active');
};

pv.buildPuzzle = function () {
	this.removePieceContainers();
	this._stage._needsUpdate = true;
	if(this._model._background !== null && this._model._options.allowRotate)
		this._stage.addChild(this._model._background);
	if(this._model._hint !== null && this._model._options.allowHint)
		this._stage.addChild(this._model._hint);
	
	// add fixed pieces first so they are on the bottom, refactor this	
	for(var i = 0; i < this._model._pieceContainers.length; i++) {
		if(this._model._pieceContainers[i].isFixed()) {
			this._model._pieceContainers[i].sortPieces();
			for(var j = 0; j < this._model._pieceContainers[i]._pieces.length; j++) {
				this._model._pieceContainers[i].addChild(this._model._pieceContainers[i]._pieces[j]);
			}
			this._stage.addChild(this._model._pieceContainers[i]);
		}
	}
	// add unfixed pieces
	for(var i = 0; i < this._model._pieceContainers.length; i++) {
		if(!this._model._pieceContainers[i].isFixed()) {
			this._model._pieceContainers[i].sortPieces();
			for(var j = 0; j < this._model._pieceContainers[i]._pieces.length; j++) {
				this._model._pieceContainers[i].addChild(this._model._pieceContainers[i]._pieces[j]);
			}
			this._stage.addChild(this._model._pieceContainers[i]);
		}
	}
	this._stage._needsUpdate = true;
};
var PuzzleBox = PuzzleBox || {};

/**
 * The PuzzleController is responsible for communication between the model
 * and the view. It handles any actions that occur within the puzzle.
 *
 * @constructor
 * @param {Puzzle} model The puzzle model
 * @param {PuzzleView} view The puzzle view
 */
PuzzleBox.PuzzleController = function(model, view) {

	this._model = model;
	this._view = view;
	
	this.initialize();
};

var ctrl = PuzzleBox.PuzzleController.prototype;

ctrl.initialize = function() {

	// Events fired by user interaction
	this._view.clickedOnPiece.attach(this.pressedOnPieceContainer.bind(this));
	this._view.clickedOnNothing.attach(this.pressedOnNothing.bind(this));
	this._view.mouseOverPiece.attach(this.hoveredOver.bind(this));
	this._view.mouseOutPiece.attach(this.hoveredOut.bind(this));
	this._view.releasePiece.attach(this.pieceContainerReleased.bind(this));
	this._view.dragPiece.attach(this.pieceContainerDragged.bind(this));
	this._view.dragRotateHandle.attach(this.rotateHandleDragged.bind(this));
	this._view.clickStartButton.attach(this.startPuzzle.bind(this));
	this._view.validationRequested.attach(this.handleValidation.bind(this));

	// Events fired when puzzle data changes
	this._model.fileLoaded.attach(this.handleFileLoad.bind(this));
	this._model.progressChange.attach(this.progressChanged.bind(this));
	this._model.puzzleLoaded.attach(this.loadingComplete.bind(this));
	this._model.pieceContainerAdded.attach(this.pieceContainerAdded.bind(this));
	this._model.pieceContainerRemoved.attach(this.pieceContainerRemoved.bind(this));
	this._model.pieceAdded.attach(this.pieceAdded.bind(this));
	this._model.pieceRemoved.attach(this.pieceRemoved.bind(this));
	this._model.selectedPieceChanged.attach(this.selectedPieceChanged.bind(this));
	this._model.pointsConnected.attach(this.pointsConnected.bind(this));
	this._model.puzzleComplete.attach(this.puzzleCompleted.bind(this));
	this._model.backgroundSet.attach(this.backgroundSet.bind(this));
};

ctrl.handleFileLoad = function (sender, args) {
	var item = args.event.item; // A reference to the item that was passed in
	var type = item.type;
	if(item.id === 'background')
	{
		
		this._view.setAspectRatio(args.event.result.width/args.event.result.height);
		this._view.resizeHolder($(window).width());
		this._view.showBackground(item.src);
	}
		
	if (type == createjs.LoadQueue.IMAGE) {
		if(item.state == 'neutral') {
			this._model._pieces.push(new PuzzleBox.Piece({
				img:args.event.result, 
				name: item.id, 
				displayName: item.name,
				fixed:item.fixed, 
				parentX:item.x, 
				parentY:item.y,
				zindex: item.zindex,
				scale: item.scale || 1
			}));
		}
	}
	debug.log("File loaded", args.event);
};

ctrl.handleValidation = function(sender, args) {
	if(this._model.isInSuccessState()) {
		this._view.notifySuccess();
	} else {
		this._view.notifyFail();
	}
};

ctrl.progressChanged = function(sender, args) {
	var e = args.event;
	var amount = Math.round(e.loaded*100);
	this._view.updateProgressBar(amount);
};

ctrl.startPuzzle = function() {
	this._view.hideLoadingWindow();
	// Build the puzzle
	this._model.setupPuzzle();
	if(this._model._options.showTitle)
		this._view.addTitle(this._model._data.title);
	this._view.buildPuzzle();
	if(this._model._options.allowHint)
		this._view.showHintToggle();

	this._view.resizePuzzle(window.innerWidth, window.innerHeight);
};

ctrl.loadingComplete = function() {

	this._view.enableStartButton();
};

ctrl.pressedOnNothing = function(sender, args) {
	this._model.deselectPieces();
	debug.log("Clicked on nothing");
};

ctrl.pressedOnPieceContainer = function(sender, args) {
	var clickedOn = args.piece;
	if(args.piece.type == "piece")
	{
		clickedOn = args.piece.getParentPieceContainer();
	}
	if(clickedOn.type == "piece-container") {
		if(!clickedOn.isFixed())
			this._model.setSelectedPiece(clickedOn);
	}
	debug.log(args, "Clicked on an object");
};

ctrl.pieceContainerAdded = function(sender, args) {
	this._view.buildPuzzle();
	debug.log(args.pieceContainer, "Added piece container to stage");
};

ctrl.pieceContainerRemoved = function(sender, args) {
	this._view.updatePieceContainer(args.pieceContainer);
	debug.log(args.pieceContainer, "Removed piece container from stage");
};

ctrl.pieceAdded = function(sender, args) {
	args.piece.parent.updatePoints();
	if(this._model._options.soundEnabled) {
		createjs.Sound.play("snap").setVolume(0.25); 
	}
		

	this._view.buildPuzzle();
  	debug.log(args, "Added piece to container");
};

ctrl.pieceRemoved = function(sender, args) {
	//this._view._stage.removeChild(args.piece);
	this._view.buildPuzzle();
	debug.log(args, "Removed piece from container");
};

ctrl.selectedPieceChanged = function(sender, args) {
	if(typeof(args.oldPiece) !== "undefined" && args.oldPiece !== null) {
		this._view.updatePieceContainer(args.oldPiece);
	}
	if(typeof(args.newPiece) !== "undefined" && args.newPiece !== null) {
		this._view.updatePieceContainer(args.newPiece);
		if(this._model._options.showLabels)
			this._view.showPieceLabel(args.newPiece);
	}
	else
	{
		if(this._model._options.showLabels)
			this._view.hidePieceLabel();
	}
	debug.log("Selected piece changed");
};

ctrl.pointsConnected = function(sender, args) {
	this._view.updatePieceContainer(args.pieceContainer);
	this._model.setSelectedPiece(null);
	debug.log(args, "Points connected");
};

ctrl.rotateHandleDragged = function(sender, args) {
	if(!this._model._options.allowRotate)
		return;
	args.pieceContainer.rotatePiece(args.event);
	this._view.triggerRefresh();
};

ctrl.pieceContainerDragged = function(sender, args) {
	args.pieceContainer.movePiece(
		args.event.stageX+args.event.offset.x, 
		args.event.stageY+args.event.offset.y
	).updatePointsOffset().snapToMatch();
	this._view.updatePieceContainer(args.pieceContainer);
};

ctrl.pieceContainerReleased = function(sender, args) {
	args.pieceContainer.updatePointsOffset();
	if(!this._model._options.snapAll)
		args.pieceContainer.matchPieces();
	else
		args.pieceContainer.snapPiece();
	this._view.updatePieceContainer(args.pieceContainer);
	debug.log(args, "Piece released");
};

ctrl.hoveredOut = function(sender, args) {
	args.pieceContainer.resetPiece();
	this._view.updatePieceContainer(args.pieceContainer);
};

ctrl.hoveredOver = function(sender, args) {
	args.pieceContainer.hoverPiece();
	this._view.updatePieceContainer(args.pieceContainer);
};

ctrl.puzzleCompleted = function(sender,args) {	
	if(this._model._options.soundEnabled)
		createjs.Sound.play("success").setVolume(0.5); 

	this._view.hideHintToggle();
};

ctrl.backgroundSet = function(sender,args) {
	this._view.setAspectRatio(args.bg.image.width/args.bg.image.height);
	this._view.resizePuzzle(args.bg.image.width, args.bg.image.height);
};