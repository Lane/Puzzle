function piece_tests() {

	module('Piece.js');
	
	var piece = _pieces[0];
	var piece2 = _pieces[1];
	
	// set boundary
	test('initialize()', function() {
		equal(piece.name, "piece1", "Name correctly set");
		deepEqual({x: piece.regX, y: piece.regY}, {x:150,y:50}, "regX and regY correctly set");
	});
	
	// isEqual
	test('isEqual()', function() {
		ok(piece.isEqual(_pieces[0]), "Pieces match");
		ok(!piece.isEqual(_pieces[1]), "Pieces do not match");
	});

	// hasPoint
	test('hasPoint()', function() {
		piece.addPoint(_points[0]);
		ok(piece.hasPoint(_points[0]), "Piece has the point");
		ok(!piece.hasPoint(_points[2]), "Piece does not have the point");
	});
	
	// remove point
	test('removePoint()', function() {
		piece.removePoint(_points[0]);
		ok(!piece.hasPoint(_points[0]), "Point has been removed");
	});
	
	test('Matching Two Pieces', function() {
	
		// remove points
		piece.removeAllPoints();
		ok(piece.getPoints().length == 0, "All points removed from piece1.");
		
		// add a point
		piece.addPoint(_points[0]);
		ok((piece.getPoints().length == 1 && piece.hasPoint(_points[0])), "One point added to piece1");
		deepEqual(_points[0].getStageOffset(), { x:100, y:250 }, "Point attached to piece1 has correct stage offset");
		
		// check boundary
		ok(piece.getPieceBoundary().isEqual({top:-50, left: -150, width: 300, height: 100}),"Boundary for piece1 is correct");
		
		// remove points
		piece2.removeAllPoints();
		ok(piece2.getPoints().length == 0, "All points removed from piece2.");
		
		// add a point
		piece2.addPoint(_points[2]);
		piece2.addPoint(_points[3]);
		ok((piece2.getPoints().length == 2), "Two points added to piece2.");
		deepEqual(_points[2].getStageOffset(), { x:200, y:100 }, "Point attached to piece2 has correct stage offset");
		
		// check boundary
		ok(piece2.getPieceBoundary().isEqual({top:-150, left: -50, width: 100, height: 300}),"Boundary for piece2 is correct");
		ok(piece2.getParentPieceContainer().getBoundingBox().isEqual({top:100, left: 200, width: 100, height: 300}),"Boundary for piece2 piece container is correct");
		
		// check matches
		_points[0].setMatch(_points[2]);
		ok((piece.getMatches().length == 0 && piece2.getMatches().length == 0), "Piece1 and Piece2 are not matched");
		
		// move piece1
		piece.getParentPieceContainer().movePiece(300,100);
		piece.updatePoints();
		ok(piece.getParentPieceContainer().getBoundingBox().isEqual({top:50, left: 150, width: 300, height: 100}), "Piece1 boundary correct after move");
		
		// rotate piece2
		piece2.getParentPieceContainer().rotation = 35;
		piece2.updatePoints();
		deepEqual(_points[2].getStageOffset(), { x:295, y:98 }, "Point attached to piece2 has correct stage offset after rotate"); // check point coordinates
		piece2.getParentPieceContainer().rotation = 0;
		piece2.updatePoints();

		// move piece2
		piece2.getParentPieceContainer().movePiece(200,250);
		piece2.updatePoints();
		ok(piece2.getParentPieceContainer().getBoundingBox().isEqual({top:100, left: 150, width: 100, height: 300}), "Piece2 boundary correct after move");
		
		// make sure match is correctly made
		console.log(piece.parent);
		console.log(piece2.parent);
		
		// check matches 
		console.log(piece.getMatches().length);
		ok((piece.getMatches().length != 0), "Both pieces are matched after move.");
		deepEqual(_points[0].getStageOffset(), _points[2].getStageOffset(), "Points have equal stage offsets");
		
		// connect the matching pieces
		ok(puzzle.connectPointWithMatch(_points[2]).getBoundingBox().isEqual({top:50, left: 150, width: 300, height: 350}), "Boundary of merged pieces is correct");
		piece.updatePoints();
		piece2.updatePoints();
		equal(piece._points.length, 0, "Piece1 has no points");
		equal(piece2._points.length, 1, "Piece2 has one point left");
		deepEqual(_points[1].getStageOffset(), {x: 400, y: 250 }, "Point 1 has correct stage offset");
		deepEqual(_points[3].getStageOffset(), {x: 250, y: 100 }, "Point 3 has correct stage offset");
		deepEqual(_points[3].getStageOffset(), {x: 250, y: 100 }, "Point 3 has correct stage offset");

		
		

	});

}