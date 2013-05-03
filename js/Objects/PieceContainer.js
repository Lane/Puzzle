/** 
 * Represents a container that holds Pieces
 *
 * @constructor
 * @augments createjs.Container
 * @this {PieceContainer}
 * @param {Object} options Option overrides
 */
function PieceContainer(options) {
	
	this._pieces = options.pieces || new Array();
	this._selected = false;
	this._rotateHandle = new RotateHandle();
	this._puzzle = null;
	this.boundary = new Boundary(9999, 9999, (2*-9999), (2*-9999));
	
	this.initialize(options);
	
	var _this = this;
		
	// Notify the puzzle of interaction events
	this.addEventListener("mouseover", function(event) { 
		_this._puzzle.mouseOverPiece.notify({ event: event, pieceContainer: _this});
	});
	
	this.addEventListener("mouseout", function(event) { 
		_this._puzzle.mouseOutPiece.notify({ event: event, pieceContainer: _this});
	});
	
	this.addEventListener("mousedown", function(event) {
	
		var pc = event.target;
		var offset = {x:pc.x-event.stageX, y:pc.y-event.stageY};
		var ob = pc.parent.getObjectUnderPoint(event.stageX, event.stageY);
		
		// if the user pressed down on a piece
		if(ob.type !== null) {
			if(ob.type == "piece") {
				event.addEventListener("mousemove", function(evt) {
					evt.offset = offset;
					_this._puzzle.dragPiece.notify({ event: evt, pieceContainer: _this});
				});
			}
			
			// if the user pressed down on the rotate handle
			if(ob.type == "rotate-handle") {
				var start = ob.parent.rotation;
				offset = {x:event.stageX, y:event.stageY};
				event.addEventListener("mousemove", function(evt) {
					evt.offset = offset;
					evt.start = start;
					_this._puzzle.dragRotateHandle.notify({ event: evt, pieceContainer: _this});
				});
			}
		}
		
		// check if any pieces match once the user lets go
		event.addEventListener("mouseup", function(evt) {
			_this._puzzle.releasePiece.notify({ event: evt, pieceContainer: _this});
		});
		
	});
}

var pc = PieceContainer.prototype = new createjs.Container();

pc.Container_initialize = pc.initialize;

// INITIALIZER
// --------------------

pc.initialize = function(options) {
	this.Container_initialize();
	
	// set parameters
	this.name = options.name || "container"+this.id;
	this.cursor = options.cursor || "pointer";
	this.x = options.x || 250;
	this.y = options.x || 250;
	this._selected = false;
	this.type = "piece-container";
	
	for(var i=0; i < this._pieces.length; i++) {
		if(typeof(this._pieces[i].parent) == "undefined" || this._pieces[i].parent == null) {
			this._pieces[i].parent = this;
		}
	}
	
	this.setBoundary();
	this.addChild(this._rotateHandle);	
}

// SETTERS
// --------------------

pc.setBoundary = function() {
	// our box: left, right, top, bottom
	var box = new Boundary(9999, 9999, (2*-9999), (2*-9999));
	
	for(var i = 0; i < this._pieces.length; i++) {
		box.extendBoundary(this._pieces[i].getPieceBoundary());
	}
	
	var offSet = box.center;
	
	this.boundary = box;
	this.boundary.top += this.y-offSet.y;
	this.boundary.left += this.x-offSet.x;
	this.boundary.bottom += this.y-offSet.y;
	this.boundary.right += this.x-offSet.x;
	return this;
}


// GETTERS
// --------------------

pc.getPieces = function () {
  return this._pieces;
}

pc.getBoundingBox = function() {
	return this.boundary;
}

pc.getPieceContainerBoundary = function() {
	return new Boundary(
		this.boundary.left-this.x+this.boundary.center.x, 
		this.boundary.top-this.y+this.boundary.center.y,
		this.boundary.width,
		this.boundary.height
	);
}

pc.getCenter = function() {

}

// FUNCTIONS
// --------------------
	
pc.addPiece = function (p) {
  this._pieces.push(p);
  p.parent = this;
  this.setBoundary();
  var oldReg = { x: this.regX, y: this.regY };
  this.regX = this._rotateHandle.x = this.boundary.getCenter().x;
  this.regY = this._rotateHandle.y = this.boundary.getCenter().y;
  var regDiff = { x: this.regX-oldReg.x, y: this.regY-oldReg.y };
  this.x += regDiff.x;
  this.y += regDiff.y;
  p.updatePoints();
  this._puzzle.pieceAdded.notify({ piece : p });
  return this._pieces;
}

pc.movePiece = function(x,y) {
	this.x = x;
	this.y = y;
	this.setBoundary();
}

pc.rotatePiece = function(e) {
	this.rotation = e.start + ((e.stageX-e.offset.x)+(e.stageY-e.offset.y));
	this.parent._needsUpdate = true;
	this.setBoundary();
}
	
pc.removePiece = function (p) {
	for(var i = 0; i < this._pieces.length; i++) {
		if(this._pieces[i].id == p.id)
		{
			this._pieces.remove(i);
			this._puzzle.pieceRemoved.notify({ piece : p });
			return this._pieces;
		}
	}
	this.setBoundary();
	return false;
}

pc.selectPiece = function() {
	this.addChild(this._rotateHandle);
	this._selected = true;
	this._rotateHandle.visible = true;
	this.parent.addChild(this);
	this.filters = [new createjs.ColorFilter(1, 1, 0.6, 1)];
}
	
pc.hoverPiece = function() {
	if(!this._selected) {
		this.filters = [new createjs.ColorFilter(0.8, 1, 0.8, 1)];
	}
}
	
pc.resetPiece = function(force) {
	force = typeof force !== 'undefined' ? force : false;
	if(!this._selected || force) {
		this._selected = false;
		this._rotateHandle.visible = false;
		this.filters = [];
	}
}

pc.matchPieces = function() {
	for(var i = 0; i < this._pieces.length; i++) {
		var matches = this._pieces[i].getMatches();
		for(var j = 0; j < matches.length; j++) {
		
			// get the piece we just connected	
			var otherPoint = matches[j].getMatch();
			var thisPoint = matches[j];
			
			this._puzzle.connectPointWithMatch(matches[j]);

			debug.log(matches[j], "Match has been made");
		}
	}
}
	
pc.isSelected = function() {
	return this._selected;
}

pc.updatePoints = function() {
	for(var i = 0; i < this._pieces.length; i++) {
		for(var j = 0; j < this._pieces[i]._points.length; j++) {
			this._pieces[i]._points[j].updatePoint();
		}
	}
}

pc.updatePointsOffset = function() {
	for(var i = 0; i < this._pieces.length; i++) {
		for(var j = 0; j < this._pieces[i]._points.length; j++) {
			this._pieces[i]._points[j].setOffset();
		}
	}
}

pc.toString = function() {
	var pcString = "<h3>" + this.name + "</h3>"
		+ "<ul class='properties'>" 
		+ "<li><span>Position: </span>" + this.x + "," + this.y + "</li>"
		+ "<li><span>Rotation:</span>" + this.rotation + "</li>"
		+ "<li><span>Centre: </span>" + this.regX + "," + this.regY + "</li>"
		+ "<li><span>Dimensions: </span>" + this.boundary.width + "," + this.boundary.height + "</li>"
		+ "<li><span>Boundaries: </span>" + (this.boundary.left) + "," + (this.boundary.top) + " : " + (this.boundary.right) + "," + (this.boundary.bottom)
		+ "<li>";
	for(var i = 0; i < this._pieces.length; i++) {
		pcString += this._pieces[i].toString();
	}
	pcString += "</li></ul>";
	
	// pcString += this._rotateHandle.toString();
	
	return pcString;
}