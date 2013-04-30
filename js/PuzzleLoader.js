function PuzzleBuilder() {

	// create the puzzle
	this.puzzle = new Puzzle();
	this.puzzleView = new PuzzleView(this.puzzle);
	this.puzzleController = new PuzzleController(this.puzzle, this.puzzleView);
	this.queue = new createjs.LoadQueue();
	this.pieces = new Array();
	
	this.loadObject = null;

	this.initialize();

}

pb = PuzzleBuilder.prototype;

pb.initialize = function() {
	var that = this;
	this.queue.addEventListener("complete", this.doneLoading.bind(this));
	this.queue.addEventListener("fileload", this.fileLoaded.bind(this));
}

pb.loadPuzzle = function(pzl) {

	this.loadObject = pzl;

	// load background
	this.queue.loadManifest(pzl.background);
	this.queue.loadManifest(pzl.pieces); // load pieces
}

pb.fileLoaded = function (event) {
	var item = event.item; // A reference to the item that was passed in
	var type = item.type;
	if(item.id == "background") {
		var bg = new createjs.Bitmap(item.src);
		this.puzzleView._stage.addChild(bg);
		debug.log("adding background");
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