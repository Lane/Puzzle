/**
 * The PuzzleView contains the stage and does any of the actual rendering 
 * to the canvas.
 *
 * @constructor
 * @param {Puzzle} options Option overrides
 * @property {Event} clickedOnPiece - Event that occurs when the user clicks on a piece
 * @property {Event} clickedOnNothing - Event that occurs when the user clicks on nothing
 */
function PuzzleView(model) {
  this._model = model;
  this._stage = new createjs.Stage(this._model._canvas);
  
  this.clickedOnPiece = new Event(this);
  this.clickedOnNothing = new Event(this);

	this.initialize();
}

var pv = PuzzleView.prototype;

pv.initialize = function() {
	this._stage._needsUpdate = false;
	
	createjs.Touch.enable(this._stage);
	this._stage.mouseEventsEnabled = true;
	this._stage.enableMouseOver(10000);
	this._stage.mouseMoveOutside = true; 
	
	var _this = this;
	
	// attach listeners to stage events
	this._stage.addEventListener("stagemousedown", function(e) {
		var stage = _this._stage;
		var ob = stage.getObjectUnderPoint(stage.mouseX, stage.mouseY);
		// if no objects were clicked
		if(ob.type == null) {
			_this.clickedOnNothing.notify({ event: e });
		} else {
			_this.clickedOnPiece.notify({event : e, piece : ob });	
		}
	});
};

pv.getStage = function() {
	return this._stage;
};

pv.update = function (event) {
	if(!createjs.Ticker.getPaused()) {
	  if(this._stage._needsUpdate) {
	  	this._stage._needsUpdate = false;
	  	this._stage.update(event);
	  }
  }
};
  
pv.triggerRefresh = function() {
	this._stage._needsUpdate = true;
};
  
// using cache create a new canvas for each element,
// redefining the cache area is resource intensive,
// so only do it WHEN ABSOLUTELY NECESSARY.
pv.updatePieceContainer = function(pc) {
	var b = pc.getPieceContainerBoundary();
	if(!pc.cacheCanvas) {
		pc.cache(b.left, b.top, b.width, b.height);
	}
	else 
	{
		if(
				(b.left == pc._cacheOffsetX)
				&& (b.top == pc._cacheOffsetY)
				&& (b.width == pc.cacheCanvas.width)
				&& (b.height == pc.cacheCanvas.height)
			) {
				pc.updateCache();
			} else {
				pc.cache(b.left, b.top, b.width, b.height);
				debug.log("boundary doesn't match cache, updating");
			}
	}
	this._stage._needsUpdate = true;
};
  
pv.removePieceContainers = function() {
	for(var i = 0; i < this._stage.children.length; i++) {
		var pc = this._stage.children[i];
		if(pc.type !== null) {
			if(pc.type == "piece-container")
				this._stage.removeChildAt(i);
		}
	}
};

pv.buildPuzzle = function () {
	this.removePieceContainers();
	this._stage._needsUpdate = true;
	if(this._model._background !== null)
		this._stage.addChild(this._model._background);
		
	for(var i = 0; i < this._model._pieceContainers.length; i++) {
		for(var j = 0; j < this._model._pieceContainers[i]._pieces.length; j++) {
			this._model._pieceContainers[i].addChild(this._model._pieceContainers[i]._pieces[j]);
			if(typeof(debugPoints) !== "undefined") {
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
};
