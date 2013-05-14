/**
 * The PuzzleController is responsible for communication between the model
 * and the view. It handles any actions that occur within the puzzle.
 *
 * @constructor
 * @param {Puzzle} model The puzzle model
 * @param {PuzzleView} view The puzzle view
 */
function PuzzleController(model, view) {

  this._model = model; // private
  this._view = view; // private
	
	this.initialize();
}

var ctrl = PuzzleController.prototype;

ctrl.initialize = function() {
	this._view.clickedOnPiece.attach(this.pressedOnPieceContainer.bind(this));
	this._view.clickedOnNothing.attach(this.pressedOnNothing.bind(this));
	
	this._model.pieceContainerAdded.attach(this.pieceContainerAdded.bind(this));
	this._model.pieceContainerRemoved.attach(this.pieceContainerRemoved.bind(this));
	this._model.pieceAdded.attach(this.pieceAdded.bind(this));
	this._model.pieceRemoved.attach(this.pieceRemoved.bind(this));
	this._model.selectedPieceChanged.attach(this.selectedPieceChanged.bind(this));
	this._model.pointsConnected.attach(this.pointsConnected.bind(this));
	
	// attach PieceContainer events
	this._model.mouseOverPiece.attach(this.hoveredOver.bind(this));
	this._model.mouseOutPiece.attach(this.hoveredOut.bind(this));
	this._model.releasePiece.attach(this.pieceContainerReleased);
	this._model.dragPiece.attach(this.pieceContainerDragged.bind(this));
	this._model.dragRotateHandle.attach(this.rotateHandleDragged.bind(this));
}

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
	var instance = createjs.Sound.play("success"); 
	this._view.buildPuzzle();
  debug.log(args, "Added piece to container");
};

ctrl.pieceRemoved = function(sender, args) {
	//this._view._stage.removeChild(args.piece);
	this._view.buildPuzzle();
	debug.log(args, "Removed piece from container");
};

ctrl.selectedPieceChanged = function(sender, args) {
	if(typeof(args.oldPiece) !== "undefined" && args.oldPiece != null) {
		this._view.updatePieceContainer(args.oldPiece);
	}
	if(typeof(args.newPiece) !== "undefined" && args.newPiece != null) {
		this._view.updatePieceContainer(args.newPiece);
	}
	debug.log("Selected piece changed");
};

ctrl.pointsConnected = function(sender, args) {
	this._view.updatePieceContainer(args.pieceContainer);
	debug.log(args, "Points connected");
};

ctrl.rotateHandleDragged = function(sender, args) {
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
	args.pieceContainer.updatePointsOffset().matchPieces();
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