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
function Puzzle(pieceContainers) {

	this._pieceContainers = pieceContainers || new Array();
	this._selectedPiece = null;
	this._hint = null;
	this._background = null;
	
	this.pieceContainerAdded = new Event(this);
	this.pieceContainerRemoved = new Event(this);
	this.selectedPieceChanged = new Event(this);
	this.pointsConnected = new Event(this);
	this.pieceAdded = new Event(this);
	this.pieceRemoved = new Event(this);
	this.puzzleComplete = new Event(this);
	this.backgroundSet = new Event(this);
	
	this.initialize();
};

var pz = Puzzle.prototype;

pz.initialize = function() {

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
}

pz.setHint = function(hint) {
	this._hint = new createjs.Bitmap(hint);
	this._hint.alpha=0;
	this._hint.type = "hint";
	return this;
}



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
};