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
			this._model._pieces.push(new Piece({
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
	createjs.Sound.play("snap").setVolume(0.5); 
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
	createjs.Sound.play("success"); 
	this._view.hideHintToggle();
};

ctrl.backgroundSet = function(sender,args) {
	this._view.setAspectRatio(args.bg.image.width/args.bg.image.height);
	this._view.resizePuzzle(args.bg.image.width, args.bg.image.height);
};