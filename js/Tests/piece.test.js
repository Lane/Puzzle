function piece_tests() {

	module('Piece.js');
	
	var piece = _pieces[0];
	
	// set boundary
	test('initialize()', function() {
		equal(piece.name, "head.png", "Name correctly set");
		deepEqual({x: piece.regX, y: piece.regY}, {x:289,y:208}, "regX and regY correctly set");
	});
	
	// isEqual
	test('isEqual()', function() {
		ok(piece.isEqual(piece), "Pieces match");
		ok(!piece.isEqual(_pieces[1]), "Pieces do not match");
	});

	// has point
	test('hasPoint()', function() {
		piece.addPoint(_points[0]);
		ok(piece.hasPoint(_points[0]), "Piece has the point");
		ok(!piece.hasPoint(_points[1]), "Piece does not have the point");
	});

	// remove point
	test('removePoint()', function() {
		piece.removePoint(_points[0]);
		ok(!piece.hasPoint(_points[0]), "Point has been removed");
	});
	
}