function PuzzleController(model, view) {
    this._model = model;
    this._view = view;

    var _this = this;

    this._view.clickedOnPiece.attach(function (sender, args) {
    	console.log("What is happening here?");
    	console.log(args.piece);
    	var clickedOn = args.piece;
    	console.log(clickedOn);
    	if(args.piece.type == "piece")
    	{
    		clickedOn = args.piece.parent;
    	}
    	if(clickedOn.type == "piece-container") {
    		_this._model.setSelectedPiece(clickedOn);
    	}
    
    	if(debug) {
    		console.log("Clicked on an object:");
    		console.log(args);
    	}
    });

		this._view.clickedOnNothing.attach(function () {
			_this._model.deselectPieces();
		
			if(debug) {
	    	console.log("clicked on nothing");
	    }
		});
    
    // handle model events listeners
    this._model.pieceContainerAdded.attach(function (sender,args) {
        _this._view.buildPuzzle();
        //_this._view._stage.addChild(args.pieceContainer);
        _this._view._stage._needsUpdate = true;
        if(debug) {
          console.log("Added piece container to stage:");
          console.log(args.pieceContainer);
        }
    });
    
    this._model.pieceContainerRemoved.attach(function (sender, args) {
        //_this._view._stage.removeChild(args.pieceContainer);
        _this._view.buildPuzzle();
        _this._view._stage._needsUpdate = true;
        
        if(debug) {
          console.log("Removed piece container from stage:");
          console.log(args.pieceContainer);
        }
    });
    
		this._model.pieceAdded.attach(function (sender,args) {
			if(debug) {
				for(var i = 0; i < args.piece._pointMatches.length; i++) {
					args.piece._pointMatches[i]._point1.updatePoint();
					args.piece._pointMatches[i]._point2.updatePoint();
				}
			}
	    _this._view.buildPuzzle();
	    //_this._view._stage.addChild(args.pieceContainer);
	    _this._view._stage._needsUpdate = true;
	    if(debug) {
	      console.log("Added piece to container:");
	      console.log(args);
	    }
		});
		
		this._model.pieceRemoved.attach(function (sender,args) {
		    _this._view.buildPuzzle();
		    //_this._view._stage.addChild(args.pieceContainer);
		    _this._view._stage._needsUpdate = true;
		    if(debug) {
		      console.log("Removed piece from container:");
		      console.log(args);
		    }
		});
    
    this._model.selectedPieceChanged.attach(function () {
    	_this._view._stage._needsUpdate = true;
    	if(debug) {
    		console.log("selected piece changed");
    	}
    });
    
    this._model.pointsConnected.attach(function (sender, args) {
    	args.pieceContainer.cache(-600, -400, 1200, 800);
    	args.pieceContainer.updateCache();
    	_this._view._stage._needsUpdate = true;
    	if(debug) {
    		console.log("points connected");
    	}
    });
    
    // handle PieceContainer events
    this._model.mouseOverPiece.attach(function(sender,args) {
    	args.pieceContainer.hoverPiece();
    });
    
    this._model.mouseOutPiece.attach(function(sender,args) {
    	args.pieceContainer.resetPiece();
    });
    
    this._model.releasePiece.attach(function(sender,args) {
    	args.pieceContainer.matchPieces();
    	
    	if(debug) {
    		console.log("piece released:");
    		console.log(args);
    	}
    });
    
    this._model.dragPiece.attach(function(sender, args) {
    	args.pieceContainer.movePiece(
    		args.event.stageX+args.event.offset.x, 
    		args.event.stageY+args.event.offset.y
    	);
    });
    
    this._model.dragRotateHandle.attach(function(sender, args) {
    	args.pieceContainer.rotatePiece(args.event);
    });
}

PuzzleController.prototype = {
    addItem : function () {
        var item = window.prompt('Add item:', '');
        if (item) {
            this._model.addItem(item);
        }
    },

    delItem : function () {
        var index;

        index = this._model.getSelectedIndex();
        if (index !== -1) {
            this._model.removeItemAt(this._model.getSelectedIndex());
        }
    },

    updateSelected : function (index) {
        this._model.setSelectedIndex(index);
    }
};