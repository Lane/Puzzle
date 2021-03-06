var PuzzleBox = PuzzleBox || {};

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
