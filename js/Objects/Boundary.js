/** 
 * Represents a rectangular boundary for Pieces and PieceContainers 
 *
 * @constructor
 * @this {Boundary}
 * @param {int} x The horizontal offset from the centre
 * @param {int} y The vertical offset from the centre
 * @param {int} width The width of the boundary
 * @param {int} height the height of the boundary
 */
function Boundary(left, top, width, height) {

	this.top = top;
	
	this.left = left;
	
	this.width = width;
	
	this.height = height;
	
	this.initialize();

}

var bd = Boundary.prototype;

bd.initialize = function() {
	this.set(this.left, this.top, this.width, this.height);
}


// SETTERS
// --------------

bd.set = function(left, top, width, height) {
	this.top = top;
	this.right = left+width;
	this.bottom = top+height;
	this.left = left;
	this.width = width;
	this.height = height;
	this.center = { x: left+width/2, y: top+height/2 };
};

bd.setDimensions = function(dim) {
	this.set(this.left, this.top, dim.width, dim.height);
};

bd.setPosition = function(x,y) {
	this.set(x,y,this.width,this.height);
}

// GETTERS
// --------------

bd.getTopLeft = function() {
	return { x: this.left, y: this.top } 
};

bd.getCenter = function() {
	return this.center;
};

bd.getDimensions = function() {
	return { width: this.width, height: this.height }
};


// FUNCTIONS
// --------------

/*
 * Checks to see if this boundary is equal to another boundary
 *
 * @this {Boundary}
 * @param {Boundary} bd The boundary to compare to
 */
bd.isEqual = function(bd) {
	if((this.top == bd.top) 
		&& (this.left == bd.left)
		&& (this.width == bd.width)
		&& (this.height == bd.height)
		) {
		return true;
	}
	return false;
}

/*
 * Extends this boundary to encompass the `box` passed to it
 *
 * @this {Boundary}
 * @param {Boundary} box The box to encompass with this boundary
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
		
}