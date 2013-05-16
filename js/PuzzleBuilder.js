/**
 * The PuzzleBuilder handles the loading of all puzzle assets, and then 
 * builds the puzzle once all of the assets have loaded.
 *
 * @constructor
 * @property {Puzzle} puzzle - The Puzzle that is built
 * @property {PuzzleView} puzzleView - The view state of the puzzle
 * @property {createjs.LoadQueue} _queue - The load queue for the puzzle
 * @property {Array} _pieces - The view state of the puzzle
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
	this.puzzleLoaded.attach(this.handlePuzzleLoad.bind(this));
	
	this._queue.installPlugin(createjs.Sound);
	createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.FlashPlugin]);
	createjs.Sound.registerSound("assets/success.mp3|assets/success.ogg", "success");
	
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
	if(typeof(pzl.rotateHandle) !== "undefined")
		pzl.rotateHandle = { id: "rotate-handle", src : "assets/rotate.png" };
	
	this._queue.loadManifest(pzl.rotateHandle);

	this._queue.loadManifest(pzl.pieces); // load pieces
	
};

/**
 * Callback function that executes after every file that loads from the queue
 * @method PuzzleBuilder.handleFileLoad
 * @param {Object} event The file load event
 */
pb.handleFileLoad = function (sender, args) {
	var item = args.event.item; // A reference to the item that was passed in
	var type = item.type;
	if(item.id == "background") {
		var bg = new createjs.Bitmap(item.src);
		this.puzzle._background = bg;
	} else if(item.id == "rotate-handle") {
		var rh = new createjs.Bitmap(item.src);
	  rh.name = "rotate-handle";
	  rh.x = 0;
	  rh.y = 0;
		rh.regX = rh.image.width/2|0;
		rh.regY = rh.image.height/2|0;
	  rh.scaleX = rh.scaleY = rh.scale = 0.25;
	  rh.type = "rotate-handle";
	  
	  this.puzzle._rotateHandle = rh;
	
	} else {
		if (type == createjs.LoadQueue.IMAGE) {
			this._pieces.push(new Piece({
				img:args.event.result, 
				name: item.id, 
				displayName: item.name,
				fixed:item.fixed, 
				parentX:item.x, 
				parentY:item.y
			}));
		}
	}
	debug.log("File loaded", args.event);
};


pb.getPuzzleView = function() {
	return this.puzzleView;
};

pb.getPuzzle = function() {
	return this.puzzle;
};

pb.getLoadingProgress = function() {
	return this._queue.progress;
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

	var pzl = this._loadObject;

	while((p=this._pieces.pop()) != null) {
		var options = {};
		options.pieces = [p];
		options.x = p.regX+Math.round(Math.random()*(this.puzzle.getCanvas().width-p.image.width));
		options.y = p.regY+Math.round(Math.random()*(this.puzzle.getCanvas().height-p.image.height));
		this.puzzle.addPieceContainer(new PieceContainer(options));
	}
		
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
	
	this.puzzleView.buildPuzzle();
	
	createjs.Ticker.setFPS(24);
	createjs.Ticker.addEventListener("tick", this.puzzleView.update.bind(this.puzzleView));
	
	var that = this;
	
	// lets not let this run when no one is here
	window.onblur = function() { 
		createjs.Ticker.setPaused(true); 
		createjs.Ticker.removeEventListener("tick", that.puzzleView.update.bind(that.puzzleView));
	}
	window.onfocus = function() { 
		createjs.Ticker.setPaused(false);
		createjs.Ticker.addEventListener("tick", that.puzzleView.update.bind(that.puzzleView));
	}
};