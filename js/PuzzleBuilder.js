/**
 * The PuzzleBuilder handles the loading of all puzzle assets, and then 
 * builds the puzzle once all of the assets have loaded.
 *
 * @constructor
 * @property {Puzzle} puzzle - The Puzzle that is built
 * @property {PuzzleView} puzzleView - The view state of the puzzle
 * @property {PuzzleController} puzzleController - The controller of the puzzle
 * @property {Event} fileLoaded - An event fired when a file loads
 * @property {Event} puzzleLoaded - An event fired when the puzzle has completed loading
 * @property {Event} progressChange - An event fired when the loading progress changes
 * @property {createjs.LoadQueue} _queue - The load queue for the puzzle
 * @property {Array} _pieces - An array of pieces for the puzzle
 * @property {Object} _loadObject - JSON representation of the puzzle
 */

function PuzzleBuilder() {

	// create the puzzle
	this.puzzle = new Puzzle();
	this.puzzleView = new PuzzleView(this.puzzle);
	this.puzzleController = new PuzzleController(this.puzzle, this.puzzleView);
	
	this.fileLoaded = new Event(this);
	this.puzzleLoaded = new Event(this);
	this.progressChange = new Event(this);
	
	this._queue = new createjs.LoadQueue();
	this._pieces = new Array();
	
	this._loadObject = null;

	this.initialize();

};

pb = PuzzleBuilder.prototype;

pb.initialize = function() {
	var _this = this;
	
	this.fileLoaded.attach(this.handleFileLoad.bind(this));
	//this.puzzleLoaded.attach(this.handlePuzzleLoad.bind(this));
	
	this._queue.installPlugin(createjs.Sound);
	createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
	
	this._queue.addEventListener("complete", function(event) { 
		_this.puzzleLoaded.notify({ 
			event: event
		});
	});
	
	this._queue.addEventListener("fileload", function(evt) { 
		_this.fileLoaded.notify({ 
			event: evt
		});
	});
	
	this._queue.addEventListener("progress", function(evt) { 
		_this.progressChange.notify({ 
			event: evt
		});
	});
};

// GETTERS
// ----------------

/**
 * Gets the view for the puzzle
 * @method PuzzleBuilder.getPuzzleView
 * @returns {PuzzleView} The view for the puzzle
 */
pb.getPuzzleView = function() {
	return this.puzzleView;
};

/**
 * Gets the model for the puzzle
 * @method PuzzleBuilder.getPuzzle
 * @returns {Puzzle} The model for the puzzle
 */
pb.getPuzzle = function() {
	return this.puzzle;
};

/**
 * Gets the loading progress of the queue
 * @method PuzzleBuilder.getLoadingProgress
 * @returns {number} A number between 0 and 1 representing the loading progress
 */
pb.getLoadingProgress = function() {
	return this._queue.progress;
};

/**
 * Takes a JSON representation of a puzzle and adds all the assets to the 
 * loading queue.
 * @method PuzzleBuilder.loadPuzzle
 * @param {Object} pzl The JSON representation of the puzzle
 */
pb.loadPuzzle = function(pzl) {

	this._loadObject = pzl;

	// load background
	this._queue.loadManifest(pzl.background);
	this._queue.loadManifest(pzl.hint);
	this._queue.loadManifest(this._createPieceManifest(pzl.pieces)); // load pieces
	
	for(var i=0; i < pzl.sounds.length; i++) {
		var s = pzl.sounds[i];
		this._queue.loadFile({id: s.id, src: s.mp3+"|"+s.ogg });
	}
};

/**
 * Callback function that executes after every file that loads from the queue
 * @method PuzzleBuilder.handleFileLoad
 * @param {Object} event The file load event
 */
pb.handleFileLoad = function (sender, args) {
	var item = args.event.item; // A reference to the item that was passed in
	var type = item.type;

	if (type == createjs.LoadQueue.IMAGE) {
		if(item.state == 'neutral') {
			this._pieces.push(new Piece({
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


pb._createPieceManifest = function(pcs) {
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
};

/**
 * Callback function that executes after all files in the manifest have loaded.
 * This function will pop all the pieces that have been added to
 * the stack and add them to the puzzle, wrapped in a PieceContainer. This 
 * function also sets the matches of all the pieces, as defined in the 
 * loadObject.
 *
 * @method PuzzleBuilder.handlePuzzleLoad
 * @param {Object} event The finished loading event
 */
pb.handlePuzzleLoad = function(sender, args) {
	
	// Set the puzzle width and height
	var bg = this._queue.getResult('background');
	this.puzzleView.getCanvas().width = bg.width;
	this.puzzleView.getCanvas().height = bg.height;
	
	// Set the puzzle background
	this.puzzle.setBackground(bg);
	
	// Set the puzzle hint
	this.puzzle.setHint(this._queue.getResult('hint'));

	// Add all the pieces in random spots
	while((p=this._pieces.pop()) != null) {	
		p.imgNeutral = this._queue.getResult(p.name);
		p.imgHover = this._queue.getResult(p.name+'-hover');
		p.imgSelected = this._queue.getResult(p.name+'-selected');
	
		var options = {};
		options.pieces = [p];
		options.x = p.regX+Math.round(Math.random()*(this.puzzleView.getCanvas().width-p.image.width));
		options.y = p.regY+Math.round(Math.random()*(this.puzzleView.getCanvas().height-p.image.height));
		this.puzzle.addPieceContainer(new PieceContainer(options));
	}
	
	var pzl = this._loadObject;
	
	// Setup all the matches
	for(var i = 0; i < pzl.matches.length; i++) {
		var newPoint = new Point(
			this.puzzle.getPieceByName(pzl.matches[i][0].piece),
			pzl.matches[i][0].x,
			pzl.matches[i][0].y
		);
		newPoint.setMatch(new Point(
			this.puzzle.getPieceByName(pzl.matches[i][1].piece),
			pzl.matches[i][1].x,
			pzl.matches[i][1].y
		));
	}
	
	// Build the puzzle
	this.puzzleView.buildPuzzle();
};