function PuzzleView(model) {
  this._model = model;
  this._stage = new createjs.Stage(this._model._canvas);
  this._stage._needsUpdate = false;

  this.clickedOnPiece = new Event(this);
  this.clickedOnNothing = new Event(this);

  var _this = this;
  
  if (createjs.Touch.isSupported()) { createjs.Touch.enable(this._stage); }
  this._stage.mouseEventsEnabled = true;
  this._stage.enableMouseOver(10000);
  this._stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

  // attach listeners to stage events
  this._stage.addEventListener("stagemousedown", function(e) {
  	var stage = _this._stage;
  	var ob = stage.getObjectUnderPoint(stage.mouseX, stage.mouseY);
  	// if no objects were clicked
  	if(ob == null) {
  		_this.clickedOnNothing.notify({ event: e });
  	} else {
  		_this.clickedOnPiece.notify({event : e, piece : ob });	
  	}
  });
}

PuzzleView.prototype = {
  update : function (event) {
    if(this._stage._needsUpdate) {
    	this._stage._needsUpdate = false;
    	this._stage.update(event);
    }
  },
  
  triggerRefresh : function() {
  	this._stage._needsUpdate = true;
  },
  
  updatePieceContainer : function(pc) {
  	var b = pc.getPieceContainerBoundary();
  	pc.cache(b.left, b.top, b.width, b.height);
  	pc.updateCache();
  	this._stage._needsUpdate = true;
  },
  
  removePieceContainers : function() {
  	for(var i = 0; i < this._stage.children.length; i++) {
  		var pc = this._stage.children[i];
  		if(pc.type !== null) {
  			if(pc.type == "piece-container")
  				this._stage.removeChildAt(i);
  		}
  	}
  },

  buildPuzzle : function () {
  	this._stage.clear();
  	this._stage._needsUpdate = true;
  	if(this._model._background !== null)
  		this._stage.addChild(this._model._background);
  		
		for(var i = 0; i < this._model._pieceContainers.length; i++) {
			for(var j = 0; j < this._model._pieceContainers[i]._pieces.length; j++) {
				this._model._pieceContainers[i].addChild(this._model._pieceContainers[i]._pieces[j]);
				if(debug) {
					for(var k = 0; k < this._model._pieceContainers[i]._pieces[j]._points.length; k++) {
						var pCircle = new createjs.Shape();
						var p = this._model._pieceContainers[i]._pieces[j]._points[k];
						pCircle.graphics.beginFill("red").drawCircle(0, 0, 5);
						pCircle.x = p.x+p.piece.x;
						pCircle.y = p.y+p.piece.y;
						p.piece.getParentPieceContainer().addChild(pCircle);
					}
				}
			}
			this._stage.addChild(this._model._pieceContainers[i]);
		}
		this._stage._needsUpdate = true;
  }
};
