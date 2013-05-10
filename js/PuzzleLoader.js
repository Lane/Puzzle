function PuzzleBuilder() {

	// create the puzzle
	this.puzzle = new Puzzle();
	this.puzzleView = new PuzzleView(this.puzzle);
	
	this.queue = new createjs.LoadQueue();
	this.pieces = new Array();
	
	this.loadObject = null;

	this.initialize();

}

pb = PuzzleBuilder.prototype;

pb.initialize = function() {
	var that = this;
	
	new PuzzleController(this.puzzle, this.puzzleView);
	
	createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.FlashPlugin]);
	createjs.Sound.registerSound("assets/success.mp3|assets/success.ogg", "success");
	
	this.queue.addEventListener("complete", this.doneLoading.bind(this));
	this.queue.addEventListener("fileload", this.fileLoaded.bind(this));
}

pb.loadPuzzle = function(pzl) {

	this.loadObject = pzl;

	// load background
	this.queue.loadManifest(pzl.background);
	this.queue.loadManifest(pzl.rotateHandle);
	this.queue.loadManifest(pzl.pieces); // load pieces
}

pb.fileLoaded = function (event) {
	var item = event.item; // A reference to the item that was passed in
	var type = item.type;
	if(item.id == "background") {
		var bg = new createjs.Bitmap(item.src);
		bg.alpha = 0.5;
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
			this.pieces.push(new Piece({img:event.result, name: item.id}));
		}
	}
	debug.log("File loaded", event);
}

pb.doneLoading = function(event) {

	var pzl = this.loadObject;

	while((p=this.pieces.pop()) != null) {
		this.puzzle.addPieceContainer(new PieceContainer({ pieces: [p] }));
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
	
	createjs.Ticker.setFPS(30);
	createjs.Ticker.addEventListener("tick", this.puzzleView.update.bind(this.puzzleView));
	
}