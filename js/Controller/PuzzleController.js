function PuzzleController(model, view) {
    this._model = model;
    this._view = view;

    var _this = this;

    this._view.clickedOnPiece.attach(function (sender, args) {
    	var pc = args;
    	if(args.type == "piece")
    	{
    		pc = args.parent;
    	}
    	if(pc.type == "piece-container") {
    		_this._model.setSelectedPiece(pc);
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
	
    this._model.pieceContainerAdded.attach(function () {
    
    	if(debug) {
      	console.log("piece container added");
      }
    });

    this._model.pieceContainerRemoved.attach(function () {
    
    	if(debug) {
      	console.log("piece container removed");
      }
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