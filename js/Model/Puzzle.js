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
	
	
	/*
	 * Fired right after a new PieceContainer is pushed on _pieceContainers
	 * @type Event
	 */
	this.pieceContainerAdded = new Event(this);
	
	/*
	 * Fired right after a PieceContainer is removed from _pieceContainers
	 * @type Event
	 */
	this.pieceContainerRemoved = new Event(this);
	
	/*
	 * Fired when this._selectedPiece changes
	 * @type Event
	 */
	this.selectedPieceChanged = new Event(this);
	
	/*
	 * Fired when two PieceContainers have been merged at a Point
	 * @type Event
	 */
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
	
	getPieceByName : function(name) {
		for(var i = 0; i < this._pieceContainers.length; i++) {
			for(var j = 0; j < this._pieceContainers[i]._pieces.length; j++) {
				if(this._pieceContainers[i]._pieces[j].name == name) {
					return this._pieceContainers[i]._pieces[j];
				}
			}
		}
		return false;
	},
	
	addPieceContainer : function (pc) {
	    this._pieceContainers.push(pc);
	    pc._puzzle = this;
	    this.pieceContainerAdded.notify({ 
	    	pieceContainer : pc, 
	    	event :  {
	    		type : "addpiececontainer"
	    	}
	    });
	},
	
	removePieceContainer : function (pc) {
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
	},
	
	// connectAtPoints(PointMatch)
	// ----------------------------
	// adds _point1 to _point2's piece container
	
	connectAtPoints : function(pm) {
	
		var staticPoint = pm._point1;
		var movedPoint = pm._point2;
	
		// set the new x and y offset of the piece
		staticPoint.setPosition({
			x: movedPoint.x+movedPoint.piece.x-staticPoint.x,
			y: movedPoint.y+movedPoint.piece.y-staticPoint.y
		});
		
		// remove the piece from its piece container
		this.removePieceContainer(staticPoint.piece.getParentPieceContainer());
		
		// remove the match points
		pm.removeFromPieces();
		
		// add the piece to this piece container
		movedPoint.piece.getParentPieceContainer().addPiece(staticPoint.getPiece());
		
		this.pointsConnected.notify({ 
			pieceContainer: movedPoint.piece.getParentPieceContainer(), 
			event :  {
				type : "pointsconnected"
			}
		});
		
		return movedPoint.piece.getParentPieceContainer()
	},
	
	connectPointWithMatch : function(pt) {
	
		var staticPoint = pt.getMatch();
		var movedPoint = pt;
		
		// merge the piece containers
		this.mergePieceContainers(
			staticPoint.piece.getParentPieceContainer(), 
			movedPoint.piece.getParentPieceContainer(), 
			pt
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
		
	},
	
	mergePieceContainers : function(from, to, connectPoint) {
		var fromPieces = from.getPieces();
		var pc = null;
		var offsets = [connectPoint.getStageOffset(), connectPoint.getMatch().getStageOffset()];
		var difference = { 
			x: (connectPoint.x+connectPoint.piece.x)-(connectPoint.getMatch().x+connectPoint.getMatch().piece.x),
			y: (connectPoint.y+connectPoint.piece.y)-(connectPoint.getMatch().y+connectPoint.getMatch().piece.y)
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
	},
	
	getSelectedPiece : function () {
		return this._selectedPiece;
	},
	
	setSelectedPiece : function (pc) {
		var oldPiece = this._selectedPiece;
		
		if(oldPiece !== null)
			oldPiece.resetPiece(true);
		
    this._selectedPiece = pc;
    this._selectedPiece.selectPiece();
    this.selectedPieceChanged.notify({ 
    	oldPiece : oldPiece,
    	newPiece : this._selectedPiece,
    	event :  {
    		type : "selectchange"
    	}
    });
	},
	
	deselectPieces : function() {
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
	},
	
	toString : function() {
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
	}
};