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

	if(typeof(canvas) == 'undefined') {
		var canvas = document.getElementById('puzzleCanvas');
		if(canvas == null) {
			canvas = document.createElement("canvas");
			canvas.id = "puzzleCanvas";
			document.getElementsByTagName('body')[0].appendChild(canvas);
		}
	}
	
	this._canvas = canvas;
	
	this._animating = false;

  this._model = model;
  this._stage = new createjs.Stage(this._canvas);
  
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
	
	this._hoveredPiece = null;
	
	var _this = this;
	
	document.onselectstart = function(){ return false; }
	
	this._stage.addEventListener("stagemousemove", function(event) {
		var ob = _this._stage.getObjectUnderPoint(_this._stage.mouseX, _this._stage.mouseY);
		if(ob == null)
			ob = {type:"background"}
		
		if(ob.type !== "background" && ob.type !== "hint") {
			if(ob.type=="piece")
				ob = ob.parent;
				
			if(_this._hoveredPiece == null && !ob.isFixed()) {
				_this._hoveredPiece = ob;
				document.body.style.cursor='pointer';
				_this._model.mouseOverPiece.notify({ 
					event: event, 
					pieceContainer: ob
				});
			}
				
		} else {
			if(_this._hoveredPiece !== null) {
				var tmppc = _this._hoveredPiece;
				if(_this._model.getSelectedPiece() !== null) {
					document.body.style.cursor='url("assets/trex/rotate24.png") 12 12, auto';
				} else {
					document.body.style.cursor='default';
				}
				_this._model.mouseOutPiece.notify({ 
					event: event, 
					pieceContainer: tmppc
				});
				_this._hoveredPiece = null;
			}
		}
	});
	
	// attach listeners to stage events
	if(!Modernizr.touch) {
	
		this._stage.addEventListener("dblclick", function(event) {
			console.log(event);
			var ob = _this._stage.getObjectUnderPoint(event.stageX, event.stageY);
			if(ob.type == "background" || ob.type == "hint") {
				_this.clickedOnNothing.notify({ event: event });
				document.body.style.cursor='default';
			}
		});
	
		this._stage.addEventListener("mousedown", function(event) {
			
			var stage = _this._stage;
			var ob = stage.getObjectUnderPoint(stage.mouseX, stage.mouseY);
	
			var pc = ob.parent;
			var offset = {x:pc.x-event.stageX, y:pc.y-event.stageY};
			
			// if no pieces were clicked
			if(ob.type == null || ob.type == "background" || ob.type == "hint") {
				
				
				var spc = _this._model.getSelectedPiece();
				if(spc !== null) {
					var start = spc.rotation;
					offset = {x:event.stageX, y:event.stageY};
					
					event.addEventListener("mousemove", function(evt) {
						
						evt.offset = offset;
						evt.start = start;
						_this._model.dragRotateHandle.notify({ 
							event: evt, 
							pieceContainer: spc
						});
					});
				}
				
			} else {
				_this.clickedOnPiece.notify({event : event, piece : ob });
				
				// if the user pressed down on a piece
				if(ob.type !== null) {
					if(ob.type == "piece" && !ob.parent.isFixed()) {
						event.addEventListener("mousemove", function(evt) {
							evt.offset = offset;
							document.body.style.cursor='move';
							_this._model.dragPiece.notify({ 
								event: evt, 
								pieceContainer: pc
							});
						});
					}
				}
				
				// check if any pieces match once the user lets go
				event.addEventListener("mouseup", function(evt) {
					document.body.style.cursor='pointer';
					_this._model.releasePiece.notify({ 
						event: evt, 
						pieceContainer: pc
					});
				});
				
			}
		});
	} else {
		// HANDLE TOUCH
	}
};

pv.getStage = function() {
	return this._stage;
};

pv.getCanvas = function() {
	return this._canvas;
};

pv.update = function (event) {
	if(!createjs.Ticker.getPaused()) {
	  if(this._stage._needsUpdate || this._animating) {
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

pv.resizePuzzle = function(width, height) {

	if(typeof(this._stage.scaleX) == "undefined")
	{
		this._stage.scaleX = this._stage.scaleY = 1;
	}

	// scale the puzzle to width / height
	var bgWidth = this._model._background.image.width*this._stage.scaleX;
	var scaleAmount = this._canvas.width/bgWidth;
	
	this._canvas.style.width = width+'px';
	this._canvas.style.height = width/this._model.getAspectRatio()+'px';
	
	this._stage.scaleX = this._stage.scaleY = scaleAmount;
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

pv.showHint = function() {
	var _this = this;
	if(!this._animating) {
		this._animating = true;
		createjs.Tween.get(this._model._hint).to({alpha:0.25}, 500).wait(5000).call(_this.hideHint.bind(_this));
	}
}

pv.hideHint = function() {
	var _this = this;
	createjs.Tween.get(this._model._hint).to({alpha:0}, 500).call(function() { _this._animating = false; });
}

pv.buildPuzzle = function () {
	this.removePieceContainers();
	this._stage._needsUpdate = true;
	if(this._model._background !== null)
		this._stage.addChild(this._model._background);
	if(this._model._hint !== null)
		this._stage.addChild(this._model._hint);
	
	// add fixed pieces first so they are on the bottom, refactor this	
	for(var i = 0; i < this._model._pieceContainers.length; i++) {
		if(this._model._pieceContainers[i].isFixed()) {
			this._model._pieceContainers[i].sortPieces();
			for(var j = 0; j < this._model._pieceContainers[i]._pieces.length; j++) {
				this._model._pieceContainers[i].addChild(this._model._pieceContainers[i]._pieces[j]);
			}
			this._stage.addChild(this._model._pieceContainers[i]);
		}
	}
	// add unfixed pieces
	for(var i = 0; i < this._model._pieceContainers.length; i++) {
		if(!this._model._pieceContainers[i].isFixed()) {
			this._model._pieceContainers[i].sortPieces();
			for(var j = 0; j < this._model._pieceContainers[i]._pieces.length; j++) {
				this._model._pieceContainers[i].addChild(this._model._pieceContainers[i]._pieces[j]);
			}
			this._stage.addChild(this._model._pieceContainers[i]);
		}
	}
	this._stage._needsUpdate = true;
};
