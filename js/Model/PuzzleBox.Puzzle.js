var PuzzleBox = PuzzleBox || {};

/** 
 * Represents a 2D puzzle element. 
 *
 * @constructor
 * @param {Array} pieceContainers - The piece containers for the puzzle
 * @property {Array} _pieceContainers - The piece containers inside the puzzle
 * @property {Piece} _selectedPiece - The currently selected piece
 * @property {createjs.Bitmap} _hint - An image overlay of the completed puzzle
 * @property {createjs.Bitmap} _background - An image to use for the background of the puzzle
 * @property {Piece} _selectedPiece - The currently selected piece
 * @property {Event} pieceContainerAdded - Fired right after a new PieceContainer is pushed on _pieceContainers
 * @property {Event} pieceContainerRemoved - Fired right after a PieceContainer is removed from _pieceContainers
 * @property {Event} selectedPieceChanged - Fired when _selectedPiece changes
 * @property {Event} pointsConnected - Fired when two PieceContainers have been connected at a Point
 * @property {Event} pieceAdded - Fired when a piece is added to a piece container
 * @property {Event} pieceRemoved - Fired when a piece is removed from a piece container
 * @property {Event} puzzleComplete - Fired when the puzzle is done
 */
PuzzleBox.Puzzle = function(data) {

	this.id = data.id || 'puzzleRoot';
	this._pieceContainers = new Array();
	this._pieces = new Array();
	this._selectedPiece = null;
	this._hint = null;
	this._data = data || { };
	this._background = null;
	this._queue = new createjs.LoadQueue();	
	this._View = null;
	this._Controller = null;
	this._options = {
		allowRotate: true,
		allowHint: true,
		showLabels: true,
		snapAll: false,
		snapRadius: 50,
		showTitle: true
	};

	if (typeof data.options == 'object') {
		this._options = $.extend(this._options, data.options);
	}
	
	
	this.pieceContainerAdded = new PuzzleBox.Event(this);
	this.pieceContainerRemoved = new PuzzleBox.Event(this);
	this.selectedPieceChanged = new PuzzleBox.Event(this);
	this.pointsConnected = new PuzzleBox.Event(this);
	this.pieceAdded = new PuzzleBox.Event(this);
	this.pieceRemoved = new PuzzleBox.Event(this);
	this.puzzleComplete = new PuzzleBox.Event(this);
	this.backgroundSet = new PuzzleBox.Event(this);
	this.puzzleLoaded = new PuzzleBox.Event(this);
	this.fileLoaded = new PuzzleBox.Event(this);
	this.progressChange = new PuzzleBox.Event(this);
	
	this.initialize();

};

var pz = PuzzleBox.Puzzle.prototype;

pz.initialize = function() { 

	$('body').addClass(this._data.id);
	
	// Install the sound plugin
	this._queue.installPlugin(createjs.Sound);
	createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
	
	var _pzl = this;

	// Setup the loading listeners
	this._queue.addEventListener("complete", function(event) { 

		_pzl.puzzleLoaded.notify({ 
			event: event
		});
	});
	
	this._queue.addEventListener("fileload", function(evt) { 
		_pzl.fileLoaded.notify({ 
			event: evt
		});
	});
	
	this._queue.addEventListener("progress", function(evt) { 
		_pzl.progressChange.notify({ 
			event: evt
		});
	});

	this._View = new PuzzleBox.PuzzleView(this);
	this._View.showLoadingWindow(
		this._data.title, 
		this._data.instructionText,
		this._data.instructionGif,
		this._data.instructionMouse
	);
	this._Controller = new PuzzleBox.PuzzleController(this, this._View);

	this.loadPuzzle();
};

pz.loadPuzzle = function() {

	var pzl = this._data;

	// Load background
	this._queue.loadManifest(pzl.background);

	// Load the hint image
	this._queue.loadManifest(pzl.hint);

	var pieceManifest = (function(pcs) {
		var manifest = [];
		for(var i=0; i < pcs.length; i++) {
			pcs[i].state = 'neutral';
			manifest.push(pcs[i]);
			if(pcs[i].hover !== null)
				manifest.push({ id: pcs[i].id+"-hover", src: pcs[i].hover, state: 'hover' });
			if(pcs[i].selected !== null)
				manifest.push({ id: pcs[i].id+"-selected", src: pcs[i].selected, state: 'selected' });
		}
		return manifest;
	})(pzl.pieces);

	// Load the pieces
	this._queue.loadManifest(pieceManifest);

	// Load the sounds
	for(var i=0; i < pzl.sounds.length; i++) {
		var s = pzl.sounds[i];
		this._queue.loadFile({id: s.id, src: s.mp3+"|"+s.ogg });
	}

};

pz.setupPuzzle = function() {
	// Set the puzzle width and height
	var bg = this._queue.getResult('background');
	
	// Set the puzzle background
	this.setBackground(bg);
	
	// Set the puzzle hint
	if(this._options.allowHint){
		this.setHint(this._queue.getResult('hint'));
		this._View.enableHintButton();
	}

	if(this._options.snapAll) {
		this._View.enableValidateButton();
	}
		

	// Add all the pieces in random spots
	while((p=this._pieces.pop()) != null) {	
		p.imgNeutral = this._queue.getResult(p.name);
		p.imgHover = this._queue.getResult(p.name+'-hover');
		p.imgSelected = this._queue.getResult(p.name+'-selected');
	
		var options = {};
		var bgSize = this.getBackgroundSize();
		options.pieces = [p];
		if(typeof(this._options.placementBox) === "object" && !p.fixed)
		{
			var b = this._options.placementBox;
			options.x = b.x+p.regX+Math.round(Math.random()*(b.width-p.image.width));
			options.y = b.y+p.regY+Math.round(Math.random()*(b.height-p.image.height));
		}
		else 
		{
			options.x = p.regX+Math.round(Math.random()*(this._View.getCanvas().width-p.image.width));
			options.y = p.regY+Math.round(Math.random()*(this._View.getCanvas().height-p.image.height));	
		}

		this.addPieceContainer(new PuzzleBox.PieceContainer(options));
	}
	
	var pzl = this._data;
	
	// If you can snap to any point, setup the success state
	if(this._options.snapAll) {
		// setup matches to snap to
		for(var i = 0; i < pzl.matches.length; i++) {
			for(var j = 0; j < pzl.pieces.length; j++) {
				var newPoint = new PuzzleBox.Point(
					this.getPieceByName(pzl.matches[i].piece),
					pzl.matches[i].x,
					pzl.matches[i].y
				);
				newPoint.setMatch(new PuzzleBox.Point(this.getPieceByName(pzl.pieces[j].id),0,0));
			}
		}
		// build the success state for the puzzle
		var successState = new Array();
		for(var i = 0; i < pzl.success.length; i++) {
			var piece1 = this.getPieceByName(pzl.success[i][0].piece);
			var piece2 = this.getPieceByName(pzl.success[i][1].piece);
			// todo: account for piece1 offset
			var successCondition = {
				id: piece1.name,
				x: piece2.boundary.width/2+pzl.success[i][1].x, 
				y: piece2.boundary.height/2+pzl.success[i][1].y, 
			};
			successState.push(successCondition);
		} 
		this.setSuccessState(successState);

	// Pieces only snap to their match
	} else {
		for(var i = 0; i < pzl.matches.length; i++) {
			var newPoint = new PuzzleBox.Point(
				this.getPieceByName(pzl.matches[i][0].piece),
				pzl.matches[i][0].x,
				pzl.matches[i][0].y
			);
			newPoint.setMatch(new PuzzleBox.Point(
				this.getPieceByName(pzl.matches[i][1].piece),
				pzl.matches[i][1].x,
				pzl.matches[i][1].y
			));
		}
	}

	// notify that the puzzle is ready
	this.puzzleLoaded.notify({
		event: { name: "Puzzle Loaded" }
	});

};


// GETTERS
// ----------------------------

/**
 * Gets the piece containers for the puzzle
 * @method Puzzle.getPieceContainers
 * @returns {Array} The piece containers for this puzzle
 */	
pz.getPieceContainers = function () {
	return this._pieceContainers;
};

/**
 * Gets a puzzle piece by name
 * @method Puzzle.getPieceByName
 * @returns {Piece|Boolean} The piece with the provided name, or false if it is not found
 */	
pz.getPieceByName = function(name) {
	for(var i = 0; i < this._pieceContainers.length; i++) {
		for(var j = 0; j < this._pieceContainers[i]._pieces.length; j++) {
			if(this._pieceContainers[i]._pieces[j].name == name) {
				return this._pieceContainers[i]._pieces[j];
			}
		}
	}
	return false;
};

pz.getContainerByPieceName = function(name) {
	for(var i = 0; i < this._pieceContainers.length; i++) {
		for(var j = 0; j < this._pieceContainers[i]._pieces.length; j++) {
			if(this._pieceContainers[i]._pieces[j].name == name) {
				return this._pieceContainers[i];
			}
		}
	}
	return false;
};

/**
 * Gets the selected puzzle PieceContainer
 * @method Puzzle.getSelectedPiece
 * @returns {PieceContainer} The selected PieceContainer
 */
pz.getSelectedPiece = function () {
	return this._selectedPiece;
};

/**
 * Get puzzle background size
 * @method Puzzle.getBackgroundSize
 * @returns {Object} Width and height of the background
 */
pz.getBackgroundSize = function () {
	return { 
		width: 	this._background.image.width, 
		height: this._background.image.width 
	}
};

// SETTERS
// ----------------------------

/**
 * Sets the piece container as the selected piece
 * @method Puzzle.setSelectedPiece
 * @param {PieceContainer} pc The piece container to select
 */
pz.setSelectedPiece = function (pc) {
	var oldPiece = this._selectedPiece;
	
	if(oldPiece !== null)
		oldPiece.resetPiece(true);
	
  this._selectedPiece = pc;
  if(pc !== null)
  	this._selectedPiece.selectPiece();
  	
  this.selectedPieceChanged.notify({ 
  	oldPiece : oldPiece,
  	newPiece : this._selectedPiece,
  	event :  {
  		type : "selectchange"
  	}
  });
};

/**
 * Sets the background image for the puzzle
 * @method Puzzle.setBackground
 * @param {Image} bg The image object to use for the background
 */
pz.setBackground = function(bg) {
	this._background = new createjs.Bitmap(bg);
	this._background.type = "background";
	this.backgroundSet.notify({
		bg : this._background,
		event : {
			type : "backgroundset"
		}
	});
	return this;
};

/**
 * Sets the hint for the puzzle
 * @method Puzzle.setHint
 * @param {Image} hint The hint image containing the completed puzzle
 */
pz.setHint = function(hint) {
	this._hint = new createjs.Bitmap(hint);
	this._hint.alpha=0;
	this._hint.type = "hint";
	return this;
};

pz.setSuccessState = function(success) {
	this._successState = success;
	return this;
};



// FUNCTIONS
// ----------------------------

/**
 * Adds a piece container to the puzzle
 * @method Puzzle.addPieceContainer
 * @param {PieceContainer} pc The piece container to add to the puzzle
 */
pz.addPieceContainer = function (pc) {
  this._pieceContainers.push(pc);
  pc._puzzle = this;
  this.pieceContainerAdded.notify({ 
  	pieceContainer : pc, 
  	event :  {
  		type : "addpiececontainer"
  	}
  });
};

/**
 * Removes a piece container from the puzzle
 * @method Puzzle.removePieceContainer
 * @param {PieceContainer} pc The piece container to remove to the puzzle
 * @returns {boolean} True if the piece is removed, false if it is not
 */
pz.removePieceContainer = function (pc) {
	for(var i = 0; i < this._pieceContainers.length; i++) {
		if(this._pieceContainers[i].id == pc.id)
		{
			this._pieceContainers.remove(i);
			if(pc.isSelected()) {
				this._selectedPiece = null;
			}
			this.pieceContainerRemoved.notify({ 
				pieceContainer : pc, 
				event :  {
					type : "removepiececontainer"
				}
			});
			return true;
		}
	}
	return false;
};

/**
 * Connects two pieces at the point passed to the function
 * @method Puzzle.connectPointWithMatch
 * @param {Point} pt The point to connect
 * @returns {Puzzle} this puzzle
 */	
pz.connectPointWithMatch = function(pt) {
	
	var staticPoint = pt.getMatch();
	var movedPoint = pt;
	
	// merge the piece containers
	this.mergePieceContainers(
		movedPoint.getPiece().getParentPieceContainer(), 
		staticPoint.getPiece().getParentPieceContainer(),
		pt.getMatch()
	);
	
	// remove the matched points from the pieces
	movedPoint.getPiece().removePoint(movedPoint);
	staticPoint.getPiece().removePoint(staticPoint);
	pt = null;
	
	// deselect the snapped piece container
	movedPoint.getPiece().getParentPieceContainer().resetPiece(true);
	
	// let the puzzle know that we connected two points	
	this.pointsConnected.notify({ 
		pieceContainer: movedPoint.getPiece().getParentPieceContainer(), 
		event :  {
			type : "pointsconnected"
		}
	});
	
	// check if the puzzle is finished
	if(this.isComplete())
	{
		this.puzzleComplete.notify({ 
			pieceContainer: movedPoint.getPiece().getParentPieceContainer(), 
			event :  {
				type : "puzzlecomplete"
			}
		});
	}
	
	return movedPoint.piece.getParentPieceContainer();
		
};

/**
 * Takes the pieces from one piece container and moves them into another
 * piece container
 * @method Puzzle.connectPointWithMatch
 * @param {PieceContainer} from The piece container to move from
 * @param {PieceContainer} to The piece container to move to
 * @param {Point} connectPoint The point to merge to
 */	
pz.mergePieceContainers = function(from, to, connectPoint) {

	var fromPieces = from.getPieces();
	var pc = null;
	
	// calculate the difference so the pieces are placed correctly when moved
	var difference = { 
		x: 	(connectPoint.x+connectPoint.piece.x)
				-(connectPoint.getMatch().x+connectPoint.getMatch().piece.x),
		y: 	(connectPoint.y+connectPoint.piece.y)
				-(connectPoint.getMatch().y+connectPoint.getMatch().piece.y)
	};
	
	// pop off each piece and move it to the piece container
	while((pc=fromPieces.pop()) != null) {	
		pc.set({
			x: difference.x+pc.x, 
			y: difference.y+pc.y
		});
		pc.setBoundary();
		to.addPiece(pc);
		to.setBoundary();
		from.removePiece(pc);
	}
	
	// clean up the stage by removing the empty piece container
	this.removePieceContainer(from);
	
	return this;
	
};

/**
 * Removes selected status from the selected piece
 * @method Puzzle.deselectPieces
 * @returns {Puzzle} This puzzle
 */	
pz.deselectPieces = function() {
	if(this._selectedPiece !== null) {
		this._selectedPiece.resetPiece(true);
		var oldPiece = this._selectedPiece;
		this._selectedPiece = null;
		// let the puzzle know the selected piece has changed
		this.selectedPieceChanged.notify({ 
			oldPiece : oldPiece,
			event :  {
				type : "selectchange"
			}
		});
	}
	return this;
};

pz.isInSuccessState = function() {
	var threshold = 0;
	if(typeof this._successState === "undefined")
		return false;

	for(var i = 0; i < this._successState.length; i++) {
		var sc = this._successState[i];
		var pc = this.getContainerByPieceName(sc.id);
		threshold += Math.abs(sc.x-pc.x);
		threshold += Math.abs(sc.y-pc.y);
	}

	if(threshold > 20)
		return false;
	
	return true;
};

/**
 * Checks to see if the puzzle is in a complete state
 * @method Puzzle.isComplete
 * @returns {boolean} true if the puzzle is complete, false if not
 */	
pz.isComplete = function() {
	if(this._pieceContainers.length == 1)
		return true;
	return false;
};
	
pz.toString = function() {
	var puzzleString = "<ul>";
		
	if(this._selectedPiece !== null) {
		puzzleString += "<li class='selected-piece'>" + 
				this._selectedPiece.toString() + 
			"</li>";
	} else {
		puzzleString += "<li class='no-pieces'>No pieces have been selected.</li>";
	}
	
	puzzleString += "</ul>";
	/*
	puzzleString += "<li class='piece-containers'><h2>All Piece Containers</h2> "
	for(var i = 0; i < this._pieceContainers.length; i++) {
		puzzleString += this._pieceContainers[i].toString();
	}
	puzzleString += "</li></ul>";
	*/
	return puzzleString;
};