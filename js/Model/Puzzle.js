/** 
 * Represents a 2D puzzle element. 
 *
 * @constructor
 * @param {DOMElement} canvas - The canvas to render the puzzle to
 * @param {Array} pieceContainers - The piece containers for the puzzle
 * @property {DOMElement} _canvas - The canvas the puzzle is rendered to
 * @property {Array} _pieceContainers - The piece containers inside the puzzle
 * @property {Piece} _selectedPiece - The currently selected piece
 */
function Puzzle(canvas, pieceContainers) {
	if(typeof(canvas) == 'undefined') {
		var canvas = document.getElementById('puzzleCanvas');
		if(canvas == null) {
			canvas = document.createElement("canvas");
			canvas.id = "puzzleCanvas";
			document.getElementsByTagName('body')[0].appendChild(canvas);
		}
	}
	
	this._canvas = canvas;

	this._pieceContainers = pieceContainers || new Array();

	this._selectedPiece = null;
	
	this._aspectRatio = 16/9;
	
	this.initialize();
};

var pz = Puzzle.prototype;

pz.initialize = function() {

	/**
	 * Fired right after a new PieceContainer is pushed on _pieceContainers
	 * @type {Event}
	 */
	this.pieceContainerAdded = new Event(this);
	
	/**
	 * Fired right after a PieceContainer is removed from _pieceContainers
	 * @type {Event}
	 */
	this.pieceContainerRemoved = new Event(this);
	
	/**
	 * Fired when this._selectedPiece changes
	 * @type {Event}
	 */
	this.selectedPieceChanged = new Event(this);
	
	/**
	 * Fired when two PieceContainers have been merged at a Point
	 * @type {Event}
	 */
	this.pointsConnected = new Event(this);
	
	/**
	 * Fired when a piece is added to a piece container
	 * @type {Event}
	 */
	this.pieceAdded = new Event(this);
	
	/**
	 * Fired when a piece is removed to a piece container
	 * @type {Event}
	 */
	this.pieceRemoved = new Event(this);
	
	/**
	 * Fired when the mouse goes over a piece container
	 * @type {Event}
	 */
	this.mouseOverPiece = new Event(this);
	
	/**
	 * Fired when the mouse leaves a piece container
	 * @type {Event}
	 */
	this.mouseOutPiece = new Event(this);
	
	/**
	 * Fired when a piece container is dragged
	 * @type {Event}
	 */
	this.dragPiece = new Event(this);
	
	/**
	 * Fired when a rotate handle is dragged
	 * @type {Event}
	 */
	this.dragRotateHandle = new Event(this);
	
	/**
	 * Fired when a piece container is let go
	 * @type {Event}
	 */
	this.releasePiece = new Event(this);
}


// GETTERS
// ----------------------------

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

/**
 * Gets the selected puzzle PieceContainer
 * @method Puzzle.getSelectedPiece
 * @returns {PieceContainer} The selected PieceContainer
 */
pz.getSelectedPiece = function () {
	return this._selectedPiece;
};

/**
 * Gets the puzzle canvas
 * @method Puzzle.getCanvas
 * @returns {DOMElement} The canvas DOM Element
 */
pz.getCanvas = function() {
	return this._canvas;
}

pz.getAspectRatio = function() {
	return this._aspectRatio;
}

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

pz.setAspectRatio = function(ratio) {
	this._aspectRatio = ratio;
}

// FUNCTIONS
// ----------------------------
	
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
	
pz.connectPointWithMatch = function(pt) {
	
	var staticPoint = pt.getMatch();
	var movedPoint = pt;
	
	// merge the piece containers
	this.mergePieceContainers(
		movedPoint.piece.getParentPieceContainer(), 
		staticPoint.piece.getParentPieceContainer(),
		pt.getMatch()
	);
	
	// remove the matched points from the pieces
	movedPoint.piece.removePoint(movedPoint);
	staticPoint.piece.removePoint(staticPoint);
	pt = null;
		
	this.pointsConnected.notify({ 
		pieceContainer: movedPoint.piece.getParentPieceContainer(), 
		event :  {
			type : "pointsconnected"
		}
	});
	
	return movedPoint.piece.getParentPieceContainer();
		
};
	
pz.mergePieceContainers = function(from, to, connectPoint) {
	var fromPieces = from.getPieces();
	var pc = null;
	var offsets = [
		connectPoint.getStageOffset(), 
		connectPoint.getMatch().getStageOffset()
	];
	var difference = { 
		x: 	(connectPoint.x+connectPoint.piece.x)
				-(connectPoint.getMatch().x+connectPoint.getMatch().piece.x),
		y: 	(connectPoint.y+connectPoint.piece.y)
				-(connectPoint.getMatch().y+connectPoint.getMatch().piece.y)
	};
	
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
	this.removePieceContainer(from);
};
	
pz.deselectPieces = function() {
	if(this._selectedPiece !== null) {
		this._selectedPiece.resetPiece(true);
		var oldPiece = this._selectedPiece;
		this._selectedPiece = null;
		this.selectedPieceChanged.notify({ 
			oldPiece : oldPiece,
			event :  {
				type : "selectchange"
			}
		});
	}
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
};