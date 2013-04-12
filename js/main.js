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
				new Piece("assets/back-legs.png", {scale: 0.5})
			]
		});
		
		var pieceContainer3 = new PieceContainer({ 
			pieces: [
				new Piece("assets/front-legs.png", {scale: 0.5})
			] 
		});
		
		var pieceContainer4 = new PieceContainer({ 
			pieces: [
				new Piece("assets/back.png", {scale: 0.5 })
			] 
		});
		
		 
		// create the puzzle
		puzzle = new Puzzle(canvas);
		var puzzleView = new PuzzleView(puzzle);
		var puzzleController = new PuzzleController(puzzle, puzzleView);
		
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
		var pointMatches = [ 
			new PointMatch(point1, point5),
			new PointMatch(point2, point6),
			new PointMatch(point3, point4)
		];
		
		puzzleView.buildPuzzle();
		
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", handleTick);

		function handleTick(event) {
		  puzzleView.update(event);
		}
		
	}