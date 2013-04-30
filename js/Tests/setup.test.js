var puzzle;

var _pieces = new Array();
var _points = new Array();
var _containers = new Array();

function setup() {

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
		//console.log(event);
		_pieces.push(new Piece({img:event.result}));
	}
}
 
function handleComplete() {
	makePuzzle();
	
	boundary_tests();
	point_tests();
	piece_tests();
}

function makePuzzle() {
	// create the puzzle
	puzzle = new Puzzle();
	
	for(var i = 0; i < _pieces.length; i++)
	{
		_containers.push(new PieceContainer({ pieces: [_pieces[i]] }));
		puzzle.addPieceContainer(_containers[i]);
	}

	_points = [
		new Point(puzzle.getPieceByName("piece1"),-150,0),
		new Point(puzzle.getPieceByName("piece1"), 150, 0),
		new Point(puzzle.getPieceByName("piece2"), -50,-150),
		new Point(puzzle.getPieceByName("piece2"), 50,-150),
		new Point(puzzle.getPieceByName("piece3"), 0,-100),
		new Point(puzzle.getPieceByName("piece3"), 0,100),
		new Point(puzzle.getPieceByName("piece4"), 0,-50),
		new Point(puzzle.getPieceByName("piece4"), 0, 50)
	];
}