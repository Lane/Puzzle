function PuzzleView(model) {
  this._model = model;
  this._stage = new createjs.Stage(this._model._canvas);
  this._stage._needsUpdate = false;

  this.clickedOnPiece = new Event(this);
  this.clickedOnNothing = new Event(this);

  var _this = this;
  
  createjs.Touch.enable(this._stage);
  this._stage.mouseEventsEnabled = true;
  this._stage.enableMouseOver(10000);
  this._stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

  // attach listeners to stage events
  this._stage.addEventListener("stagemousedown", function(e) {
  	var stage = _this._stage;
  	var ob = stage.getObjectUnderPoint(stage.mouseX, stage.mouseY);
  	// if no objects were clicked
  	if(ob == null) {
  		_this.clickedOnNothing.notify();
  	} else {
  		_this.clickedOnPiece.notify(ob);	
  	}
  });
}

PuzzleView.prototype = {
  update : function (event) {
    if(this._stage._needsUpdate) {
    	this._stage._needsUpdate = false;
    	this._stage.update(event);
    	//console.log("update triggered");
    }
  },

  buildPuzzle : function () {
  	this._stage.removeAllChildren();
		for(var i = 0; i < this._model._pieceContainers.length; i++) {
			for(var j = 0; j < this._model._pieceContainers[i]._pieces.length; j++) {
				this._model._pieceContainers[i].addChild(this._model._pieceContainers[i]._pieces[j]);
				if(debug) {
					for(var k = 0; k < this._model._pieceContainers[i]._pieces[j]._points.length; k++) {
						this._model._pieceContainers[i].addChild(
							this._model._pieceContainers[i]._pieces[j]._points[k].circle
						);
					}
				}
			}
			this._stage.addChild(this._model._pieceContainers[i]);
		}
		this._stage._needsUpdate = true;
  }
};
