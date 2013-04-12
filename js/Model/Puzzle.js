Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


/***********************************
 * Puzzle Model
 ***********************************
 * Stores items and notifies
 * observers about changes.
 ***********************************/
 
function Puzzle(canvas, pieceContainers) {
	this._canvas = canvas;
	this._pieceContainers = pieceContainers;
	if(this._pieceContainers == null)
		this._pieceContainers = new Array();
	this._selectedPiece = null;
	
	
	this.pieceContainerAdded = new Event(this);
	this.pieceContainerRemoved = new Event(this);
	this.selectedPieceChanged = new Event(this);
	this.pointsConnected = new Event(this);
	
	// PieceContainer events
	this.pieceAdded = new Event(this);
	this.pieceRemoved = new Event(this);
	this.mouseOverPiece = new Event(this);
	this.mouseOutPiece = new Event(this);
	this.dragPiece = new Event(this);
	this.dragRotateHandle = new Event(this);
	this.releasePiece = new Event(this);
}

Puzzle.prototype = {
	getPieceContainers : function () {
	    return this._pieceContainers;
	},
	
	addPieceContainer : function (pc) {
	    this._pieceContainers.push(pc);
	    pc._puzzle = this;
	    this.pieceContainerAdded.notify({ pieceContainer : pc });
	},
	
	removePieceContainer : function (pc) {
		for(var i = 0; i < this._pieceContainers.length; i++) {
			if(this._pieceContainers[i].id == pc.id)
			{
				this._pieceContainers.remove(i);
				if(pc.isSelected()) {
					this._selectedPiece = null;
				}
				this.pieceContainerRemoved.notify({ pieceContainer : pc });
				return true;
			}
		}
		return false;
	},
	
	// connectAtPoints(PointMatch)
	// ----------------------------
	// adds _point1 to _point2's piece container
	
	connectAtPoints : function(pm) {
	
		var staticPoint = pm._point1;
		var movedPoint = pm._point2;
	
		// set the new x and y offset of the piece
		staticPoint.piece.x = movedPoint.x+movedPoint.piece.x-staticPoint.x;
		staticPoint.piece.y = movedPoint.y+movedPoint.piece.y-staticPoint.y;
		
		// remove the piece from its piece container
		this.removePieceContainer(staticPoint.piece.parent);
		
		// remove the match points
		pm.removeFromPieces();
		
		// add the piece to this piece container
		movedPoint.piece.parent.addPiece(staticPoint.piece);
		
		this.pointsConnected.notify({ pieceContainer: movedPoint.piece.parent });
		
	},
	
	getSelectedPiece : function () {
	    return this._selectedPiece;
	},
	
	setSelectedPiece : function (pc) {
		var oldPiece = this._selectedPiece;
		if(oldPiece !== null)
			oldPiece.resetPiece(true);
		if(debug) {
			console.log("selecting piece:");
			console.log(pc);
		}
		
    this._selectedPiece = pc;
    this._selectedPiece.selectPiece();
    this.selectedPieceChanged.notify({ oldPiece : oldPiece });
	},
	
	deselectPieces : function() {
		if(this._selectedPiece !== null) {
			this._selectedPiece.resetPiece(true);
			var oldPiece = this._selectedPiece;
			this._selectedPiece = null;
			this.selectedPieceChanged.notify({ oldPiece : oldPiece });
		}
	}
};