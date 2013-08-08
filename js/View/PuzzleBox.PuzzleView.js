var PuzzleBox = PuzzleBox || {};

/**
 * The PuzzleView contains the stage and does any of the actual rendering 
 * to the canvas. The view also handles user interaction and notifies the 
 * controller when events take place.
 *
 * @constructor
 * @param {Puzzle} options Option overrides
 * @property {DOMElement} _canvas - HTML Canvas Element the puzzle is rendered to
 * @property {createjs.Stage} _stage - Stage that contains the puzzle
 * @property {boolean} _animating - Set to true when animation is happening on the stage
 * @property {number} _aspectRatio - The aspect ratio (width/height) of the puzzle, used for resizing
 * @property {Puzzle} _model - The puzzle object
 * @property {Event} clickedOnPiece - Event that occurs when the user clicks on a piece
 * @property {Event} clickedOnNothing - Event that occurs when the user clicks on nothing
 * @property {Event} mouseOverPiece - Event that occurs when the mouse goes over a piece
 * @property {Event} mouseOutPiece - Event that occurs when the mouse leaves a piece
 * @property {Event} dragPiece - Event that occurs when the user drags a piece
 * @property {Event} dragRotateHandle - Event that occurs when the user drags the rotate handle
 * @property {Event} releasePiece - Event that occurs when the user releases a piece after dragging
 */
PuzzleBox.PuzzleView = function(model) {

	if(typeof(canvas) == 'undefined') {
		var canvas = document.getElementById('puzzleCanvas');
		if(canvas == null) {
			canvas = document.createElement("canvas");
			canvas.id = "puzzleCanvas";
			document.getElementsByTagName('body')[0].appendChild(canvas);
		}
	}

	createjs.Ticker.setPaused(true); 

	this._canvas = canvas;
	this._animating = false;
	this._aspectRatio = 16/9;
	this._model = model;
	this._stage = new createjs.Stage(this._canvas);
	this.clickedOnPiece = new PuzzleBox.Event(this);
	this.clickedOnNothing = new PuzzleBox.Event(this);
	this.mouseOverPiece = new PuzzleBox.Event(this);
	this.mouseOutPiece = new PuzzleBox.Event(this);
	this.dragPiece = new PuzzleBox.Event(this);
	this.dragRotateHandle = new PuzzleBox.Event(this);
	this.releasePiece = new PuzzleBox.Event(this);
	this.clickStartButton = new PuzzleBox.Event(this);
	this.validationRequested = new PuzzleBox.Event(this);

	this.Components = {
		pieceLabel : $('#piece-label'),
		hintToggle : $('#hint-toggle'),
		validateButton : $('#validate-btn'),
		progressBar : $('#progress-bar'),
		startButton : $('#start'),
		loadingLabel : $('#loading-label'),
		canvasHolder : $('#fullscreen'),
		loadingWindow : $('#loading-window'),
		loadingTitle : $('#puzzle-title'),
		loadingGif : $('#puzzle-gif'),
		loadingIntro : $('#puzzle-intro'),
		loadingGestures : $('#puzzle-gestures'),
		notifyWindow : $('#ntfy-window'),
		notifyTitle : $('#ntfy-title'),
		notifyMessage : $('#ntfy-message'),
		notifyClose : $('#ntfy-close')
	};

	var _this = this;

		// start button
	this.Components.startButton.bind("click", function(e) {
		_this.initialize();
		_this.clickStartButton.notify({
			event : e
		});
	});
};

var pv = PuzzleBox.PuzzleView.prototype;

pv.initialize = function() {
	this._stage._needsUpdate = false;
	
	this._stage.mouseEventsEnabled = true;
	this._stage.enableMouseOver(1000);
	this._stage.mouseMoveOutside = true;
	
	this._hoveredPiece = null;
	
	var _this = this;
	
	createjs.Touch.enable(this._stage);
	createjs.Ticker.setPaused(false); 
	
	// get rid of text cursor on drag
	document.onselectstart = function(){ return false; }
	
	this._stage.addEventListener("stagemousemove", function(event) {
		//console.log(event);
		var ob = _this._stage.getObjectUnderPoint(event.stageX/_this._stage.scaleX, event.stageY/_this._stage.scaleY);
		if(ob == null)
			ob = {type:"background"}
		
		if(ob.type !== "background" && ob.type !== "hint") {
			if(ob.type=="piece")
				ob = ob.parent;
				
			if(_this._hoveredPiece == null && !ob.isFixed()) {
				_this._hoveredPiece = ob;
				document.body.style.cursor='pointer';
				_this.mouseOverPiece.notify({ 
					event: event, 
					pieceContainer: ob
				});
			}
				
		} else {
			if(_this._hoveredPiece !== null) {
				var tmppc = _this._hoveredPiece;
				if(_this._model.getSelectedPiece() !== null && _this._model._options.allowRotate) {
					document.body.style.cursor='url(https://d396qusza40orc.cloudfront.net/dino101%2Fpuzzle%2Fassets%2Fcommon%2Frotate3.cur),default';
				} else {
					document.body.style.cursor='default';
				}
				_this.mouseOutPiece.notify({ 
					event: event, 
					pieceContainer: tmppc
				});
				_this._hoveredPiece = null;
			}
		}
	});
	
	// attach listeners to stage events
	
	// Double click fires "clickedOnNothing", which deselects the currently selected piece
	this._stage.addEventListener("dblclick", function(event) {
		var ob = _this._stage.getObjectUnderPoint(event.stageX/_this._stage.scaleX, event.stageY/_this._stage.scaleY);
		if(ob.type == "background" || ob.type == "hint") {
			_this.clickedOnNothing.notify({ event: event });
			document.body.style.cursor='default';
		}
	});
	
	// Mouse down fires "clickedOnPiece" if a piece was selected
	this._stage.addEventListener("mousedown", function(event) {
		var startTime = new Date().getTime();
		var stage = _this._stage;
		var ob = stage.getObjectUnderPoint(stage.mouseX/stage.scaleX, stage.mouseY/stage.scaleX);

		var pc = ob.parent;
		var offset = {
				x:(pc.x-(event.stageX/stage.scaleX)), 
				y:(pc.y-(event.stageY/stage.scaleY))
			};
		
		// if no pieces were clicked
		if(ob.type == null || ob.type == "background" || ob.type == "hint") {

			// if it's a quick click on nothing, deselect
			event.addEventListener("mouseup", function(evt) {
				var endTime = new Date().getTime();
				if((endTime - startTime) < 250) {
					_this.clickedOnNothing.notify({ event: evt });
					document.body.style.cursor='default';
				}
			});
			
			var spc = _this._model.getSelectedPiece();
			if(spc !== null && _this._model._options.allowRotate) {
				var start = spc.rotation;
				offset = {x:event.stageX/stage.scaleX, y:event.stageY/stage.scaleY};
				
				// Mouse move when the user has moused down on an empty area causes rotation
				event.addEventListener("mousemove", function(evt) {
					evt.offset = offset;
					evt.start = start;
					evt.stageX = evt.stageX/stage.scaleX;
					evt.stageY = evt.stageY/stage.scaleY;
					_this.dragRotateHandle.notify({ 
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
					// Mouse move when the user moused down on a piece causes movement
					event.addEventListener("mousemove", function(evt) {
						evt.offset = offset;
						document.body.style.cursor='move';
						evt.stageX = evt.stageX/stage.scaleX;
						evt.stageY = evt.stageY/stage.scaleY;
						_this.dragPiece.notify({ 
							event: evt, 
							pieceContainer: pc
						});
					});
				}
			}
			
			// check if any pieces match once the user lets go
			event.addEventListener("mouseup", function(evt) {
				document.body.style.cursor='pointer';
				_this.releasePiece.notify({ 
					event: evt, 
					pieceContainer: pc
				});
			});
			
		}
	});
	
	createjs.Ticker.setFPS(24);
	createjs.Ticker.addEventListener("tick", this.update.bind(this));
	
	// lets not let this run when no one is here
	window.onblur = function() { 
		createjs.Ticker.setPaused(true); 
		createjs.Ticker.removeEventListener("tick", _this.update.bind(_this));
	}
	window.onfocus = function() { 
		createjs.Ticker.setPaused(false);
		createjs.Ticker.addEventListener("tick", _this.update.bind(_this));
	}

	// hint button
	this.Components.hintToggle.bind("click", function(e) {
		_this.showHint();
	});

	// submit button
	this.Components.validateButton.bind("click", function(e) {
		_this.validationRequested.notify({
			event : e
		});
	});

	// close notification window button
	this.Components.notifyClose.bind("click", function(e) {
		_this.dismissNotification(_this.Components.notifyWindow);
	});

};

pv.getStage = function() {
	return this._stage;
};

pv.getCanvas = function() {
	return this._canvas;
};

/**
 * Gets the aspect ratio of the puzzle
 * @method PuzzleView.getAspectRatio
 * @returns {number} The decimal representation of the aspect ratio
 */
pv.getAspectRatio = function() {
	return this._aspectRatio;
};

/**
 * Sets the aspect ratio of the puzzle
 * @method PuzzleView.setAspectRatio
 * @param {number} ratio The decimal value of the ratio (width/height)
 */
pv.setAspectRatio = function(ratio) {
	this._aspectRatio = ratio;
};

pv.updateProgressBar = function(amount) {
	this.Components.progressBar.css('width', amount+'%');
};

pv.enableStartButton = function() {
	this.Components.startButton.text("Start");
	this.Components.startButton.attr('class', "btn btn-start");
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

pv.showPieceLabel = function(pc) {
	this.Components.pieceLabel.text(pc.getPieceString());
	this.Components.pieceLabel.attr("class", "active")
};

pv.hidePieceLabel = function() {
	this.Components.pieceLabel.attr('class', "inactive");
};

pv.showHintToggle = function() {
	this.Components.hintToggle.show();
};

pv.hideHintToggle = function() {
	this.Components.hintToggle.hide();
};

pv.addTitle = function(title) {
	this.Components.canvasHolder.append('<h1 id="overall-title" class="species-heading">' + title + '</h1>');
};

pv.showLoadingWindow = function(title, intro, instructionImg, gestureImg) {
	this.Components.loadingTitle.text(title);
	this.Components.loadingIntro.html(intro);
	for(var i = 0; i < instructionImg.length; i++) {
		$(".puzzle-gif-holder").append("<img src='"+instructionImg[i]+"' />")
	}
	if(instructionImg.length > 1) {
		// thanks snook
		$(function(){
    		$('.puzzle-gif-holder img:gt(0)').hide();
    		setInterval(function(){
      			$('.puzzle-gif-holder :first-child').fadeOut()
         		.next('img').fadeIn()
         		.end().appendTo('.puzzle-gif-holder');
         	}, 3000);
		});
	}
	//this.Components.loadingGif.attr('src', instructionGif);
	if(gestureImg)
		this.Components.loadingGestures.attr('src', gestureImg);
	else
		this.Components.loadingGestures.hide();
};

pv.hideLoadingWindow = function() {
	this.Components.canvasHolder.addClass("started");
	this.Components.loadingWindow.removeClass("active");
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

	if(typeof(this._stage.scaleX) === "undefined")
	{
		this._stage.scaleX = this._stage.scaleY = 1;
	}
	
	this._canvas.width = width;
	this._canvas.height = Math.round(width/this._aspectRatio);

	this.Components.canvasHolder.width(width+'px');
	this.Components.canvasHolder.height(Math.round(width/this._aspectRatio)+'px');

	// scale the puzzle to width / height
	var bgWidth = this._model._background.image.width;
	var scaleAmount = 1;
	if(bgWidth > 0)
		scaleAmount = this._canvas.width/bgWidth;
	
	this._stage.scaleX = this._stage.scaleY = this._stage.scale = scaleAmount;
	this._stage._needsUpdate = true;
};

pv.resizeHolder = function(width) {
	this.Components.canvasHolder.width(width+'px');
	this.Components.canvasHolder.height(Math.round(width/this._aspectRatio)+'px');
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
	if(!this._animating && this._model._options.allowHint) {
		this._animating = true;
		createjs.Tween.get(this._model._hint).to({alpha:0.25}, 500).wait(5000).call(_this.hideHint.bind(_this));
	}
};

pv.hideHint = function() {
	var _this = this;
	if(this._model._options.allowHint)
		createjs.Tween.get(this._model._hint).to({alpha:0}, 500).call(function() { _this._animating = false; });
};

pv.enableValidateButton = function() {
		this.Components.validateButton.removeClass('ctl-disabled');
};

pv.enableHintButton = function() {
	this.Components.hintToggle.removeClass('ctl-disabled');
};

pv.showBackground = function(bgurl) {
	this.Components.canvasHolder.css('background-image', 'url('+bgurl+')');
};

pv.notifySuccess = function() {
	this.showNotification('Correct!', 'You have successfully built the Dinosauria Tree.', 'success');
};

pv.notifyFail = function() {
	this.showNotification('Incorrect!', 'Not all the pieces are in their correct position on the Dinosauria Tree.', 'fail');
};

pv.showNotification = function(title, message, type) {
	this.Components.notifyTitle.text(title);
	this.Components.notifyMessage.text(message);
	this.Components.notifyWindow.attr('class',type + ' active');
	var topPos = (this.Components.canvasHolder.height()/2)-this.Components.notifyWindow.height()/2;
	this.Components.notifyWindow.css('top', topPos+'px')
};

pv.dismissNotification = function(element) {
	element.removeAttr('style');
	element.removeClass('active');
};

pv.buildPuzzle = function () {
	this.removePieceContainers();
	this._stage._needsUpdate = true;
	if(this._model._background !== null && this._model._options.allowRotate)
		this._stage.addChild(this._model._background);
	if(this._model._hint !== null && this._model._options.allowHint)
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
