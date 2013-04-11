	var canvas, stage, puzzle;

	var mouseTarget;	// the display object currently under the mouse, or being dragged
	var dragStarted;	// indicates whether we are currently in a drag operation
	var offset;
	var debug = true;

	function init() {
		if (window.top != window) {
			document.getElementById("header").style.display = "none";
		}
		
		document.getElementById("loader").className = "loader";
		
		// create stage and point it to the canvas:
		canvas = document.getElementById("testCanvas");
	
		var pieceContainer1 = new PieceContainer({ 
			pieces: [
				new Piece("assets/head.png", {scale: 0.5})
			] 
		});
		
		var pieceContainer2 = new PieceContainer({ 
			pieces: [
				new Piece("assets/back.png", {scale: 0.5, x: 167, y: -156}), 
				new Piece("assets/back-legs.png", {scale: 0.5})
			]
		});
		
		var pieceContainer3 = new PieceContainer({ 
			pieces: [
				new Piece("assets/front-legs.png", {scale: 0.5})
			] 
		});
		
		// create the puzzle
		var puzzle = new Puzzle(canvas);
		var puzzleView = new PuzzleView(puzzle);
		var puzzleController = new PuzzleController(puzzle, puzzleView);
		
		puzzle.addPieceContainer(pieceContainer1);
		puzzle.addPieceContainer(pieceContainer2);
		puzzle.addPieceContainer(pieceContainer3);
		
		puzzleView.buildPuzzle();
		
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", handleTick);

		function handleTick(event) {
		  puzzleView.update(event);
		}
		
	}