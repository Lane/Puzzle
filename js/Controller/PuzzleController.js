function PuzzleController(model, view) {
    this._model = model;
    this._view = view;

    var _this = this;

    this._view.clickedOnPiece.attach(function (sender, args) {

    	var clickedOn = args.piece;
    	if(args.piece.type == "piece")
    	{
    		clickedOn = args.piece.getParentPieceContainer();
    	}
    	if(clickedOn.type == "piece-container") {
    		_this._model.setSelectedPiece(clickedOn);
    	}
    
    	debug.log(args, "Clicked on an object");
    });

		this._view.clickedOnNothing.attach(function () {
			_this._model.deselectPieces();
	    debug.log("Clicked on nothing");
		});
    
    // handle model events listeners
    this._model.pieceContainerAdded.attach(function (sender,args) {
      _this._view.buildPuzzle();

      debug.log(args.pieceContainer, "Added piece container to stage");
    });
    
    this._model.pieceContainerRemoved.attach(function (sender, args) {
      _this._view.buildPuzzle();
      
      debug.log(args.pieceContainer, "Removed piece container from stage");
    });
    
		this._model.pieceAdded.attach(function (sender,args) {
		
			for(var i = 0; i < args.piece._points.length; i++) {
				args.piece._points[i].updatePoint().match.updatePoint();
			}
				
	    _this._view.buildPuzzle();

      debug.log(args, "Added piece to container");
		});
		
		this._model.pieceRemoved.attach(function (sender,args) {
		    _this._view.buildPuzzle();
		    
		    debug.log(args, "Removed piece from container");
		});
    
    this._model.selectedPieceChanged.attach(function (sender,args) {
    	if(args.oldPiece !== null)
    		_this._view.updatePieceContainer(args.oldPiece);
    	if(typeof(args.newPiece) !== "undefined") {
    		_this._view.updatePieceContainer(args.newPiece);
    	}
    	
    	debug.log("Selected piece changed");

    });
    
    this._model.pointsConnected.attach(function (sender, args) {

    	_this._view.updatePieceContainer(args.pieceContainer);

    	debug.log(args, "Points connected");
    	
    });
    
    // handle PieceContainer events
    this._model.mouseOverPiece.attach(function(sender,args) {
    	args.pieceContainer.hoverPiece();
    	_this._view.updatePieceContainer(args.pieceContainer);
    });
    
    this._model.mouseOutPiece.attach(function(sender,args) {
    	args.pieceContainer.resetPiece();
    	_this._view.updatePieceContainer(args.pieceContainer);
    });
    
    this._model.releasePiece.attach(function(sender,args) {
    	args.pieceContainer.updatePoints();
    	args.pieceContainer.matchPieces();
    		debug.log(args, "Piece released");
    });
    
    this._model.dragPiece.attach(function(sender, args) {
    	args.pieceContainer.movePiece(
    		args.event.stageX+args.event.offset.x, 
    		args.event.stageY+args.event.offset.y
    	);
    	_this._view.triggerRefresh();
    });
    
    this._model.dragRotateHandle.attach(function(sender, args) {
    	args.pieceContainer.rotatePiece(args.event);
    	_this._view.triggerRefresh();
    });
}
