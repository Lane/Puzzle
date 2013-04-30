var canvas, stage, puzzle, puzzleView, puzzleController;

var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation
var offset;

function init() {

	if (window.top != window) {
		document.getElementById("header").style.display = "none";
	}
	
	document.getElementById("loader").className = "loader";
	
	// create stage and point it to the canvas:
	canvas = document.getElementById("testCanvas");
	
	// create the puzzle
	puzzle = new Puzzle(canvas);
	puzzleView = new PuzzleView(puzzle);
	var puzzleController = new PuzzleController(puzzle, puzzleView);
	
	makeHorsePuzzle();
	
	puzzleView.buildPuzzle();
	
	createjs.Ticker.setFPS(30);
	createjs.Ticker.addEventListener("tick", handleTick);
	
}
		
function makeHorsePuzzle() {
	
	var pieceContainer1 = new PieceContainer({ 
		pieces: [
			new Piece({ imgSrc: "assets/horse/head.png"})
		] 
	});
	
	var pieceContainer2 = new PieceContainer({ 
		pieces: [
			new Piece({ imgSrc: "assets/horse/back-legs.png"})
		]
	});
	
	var pieceContainer3 = new PieceContainer({ 
		pieces: [
			new Piece({ imgSrc: "assets/horse/front-legs.png"})
		] 
	});
	
	var pieceContainer4 = new PieceContainer({ 
		pieces: [
			new Piece({ imgSrc: "assets/horse/back.png"})
		] 
	});
	
	puzzle.addPieceContainer(pieceContainer1);
	puzzle.addPieceContainer(pieceContainer2);
	puzzle.addPieceContainer(pieceContainer3);
	puzzle.addPieceContainer(pieceContainer4);
	
	// Head Point
	var point1 = new Point(pieceContainer1._pieces[0],-135,60);
	
	// Front Leg Point
	var point2 = new Point(pieceContainer3._pieces[0],-25,-164);
	
	// Back Leg Point
	var point3 = new Point(pieceContainer2._pieces[0], 80,-225);
	
	// Body Points
	var point4 = new Point(pieceContainer4._pieces[0], -88,-70); // back legs connect
	var point5 = new Point(pieceContainer4._pieces[0], 240,-80); // head connect
	var point6 = new Point(pieceContainer4._pieces[0], 200,85); // front leg connect
	
	// Match Points
	point1.setMatch(point5);
	point2.setMatch(point6);
	point3.setMatch(point4);
	
}

function makeTestPuzzle() {
	var queue = new createjs.LoadQueue();
	 queue.addEventListener("complete", handleComplete);
	 queue.addEventListener("fileload", handleFileLoad);
	 queue.loadManifest([
	     { id: "piece1", src: "assets/test/300x100.png" },
	     { id: "piece2", src: "assets/test/100x300.png" },
	     { id: "piece3", src: "assets/test/200x200.png" },
	     { id: "piece4", src: "assets/test/100x100.png" }
	 ]);
}

function handleFileLoad(event) {
	var item = event.item; // A reference to the item that was passed in
	var type = item.type;
	if (type == createjs.LoadQueue.IMAGE) {
		_pieces.push(new Piece({img:event.result}));
	}
	debug.log("File loaded", event);
}

function handleEverythingLoaded() {

}

function handleTick(event) {
  puzzleView.update(event);
}
