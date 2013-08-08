var PuzzleBox = PuzzleBox || {};

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
};