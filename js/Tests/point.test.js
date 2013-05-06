function point_tests() {

	module('Point.js');
	
	var pc = null;
	
	test('initialize()', function() {
		var pt = new Point(null, 100, 0, { x: 0, y: 0 });
			equal(pt.getRadius(), 100,"Radius is correctly calculated");
			equal(pt.getAngle(), 0,"Angle is correctly calculated");
	});
	
	test('_calculateRadius(originOffset)', function() {
		var pt = new Point();
		equal(Math.round(pt._calculateRadius({x: 100, y: 100})), 141, "Radius correctly calculated");
	});
	
	test('_calculateAngle(originOffset)', function() {
		var pt = new Point();
		equal(pt._calculateAngle({x: 100, y: 0}),0,"Correctly calculated angle: 0 degrees");
		equal(pt._calculateAngle({x: 100, y: -100}),45,"Correctly calculated angle: 45 degrees");
		equal(pt._calculateAngle({x: 0, y: -100}),90,"Correctly calculated angle: 90 degrees");
		equal(Math.round(pt._calculateAngle({x: -100, y: -150})),124,"Correctly calculated angle: 124 degrees");
		equal(pt._calculateAngle({x: -100, y: 0}),180,"Correctly calculated angle: 180 degrees");
		equal(pt._calculateAngle({x: -100, y: 100}),225,"Correctly calculated angle: 225 degrees");
		equal(pt._calculateAngle({x: 0, y: 100}),270,"Correctly calculated angle: 270 degrees");
		equal(pt._calculateAngle({x: 100, y: 100}),315,"Correctly calculated angle: 315 degrees");
	});
	
	test('_calculateRotatedCoordinates()', function() {
		var pt = _points[7];
		deepEqual(pt._calculateRotatedCoordinates(0), {x: 0, y: 50}, "Correct coordinates after no rotation");
		deepEqual(pt._calculateRotatedCoordinates(90), {x: -50, y: 0}, "Correct coordinates after 90 deg rotation");
		deepEqual(pt._calculateRotatedCoordinates(-90), {x: 50, y: 0}, "Correct coordinates after -90 deg rotation");
		deepEqual(pt._calculateRotatedCoordinates(180), {x: 0, y: -50}, "Correct coordinates after 180 deg rotation");
		deepEqual(pt._calculateRotatedCoordinates(-270), {x: -50, y: 0}, "Correct coordinates after -270 deg rotation");
		deepEqual(pt._calculateRotatedCoordinates(35), {x: -29, y: 41}, "Correct coordinates after 35 deg rotation");
		deepEqual(pt._calculateRotatedCoordinates(45), {x: -35, y: 35}, "Correct coordinates after 45 deg rotation");
		// CHANGE ORIGIN AND TEST
		pt.piece.x = 400;
		pt.piece.y = 200;
		pt.piece.updatePoints();
		deepEqual(pt._calculateRotatedCoordinates(0), {x: 400, y: 250}, "Correct coordinates after piece move");
		deepEqual(pt._calculateRotatedCoordinates(45), {x: 106, y: 460}, "Correct coordinates after 45 deg rotation and piece move");
		deepEqual(pt._calculateRotatedCoordinates(-45), {x: 460, y: -106}, "Correct coordinates after -45 deg rotation and piece move");
	});
	
	test('getOffsetFromOrigin()', function() {
		var pt = new Point(pc, 100, -100, { x: 0, y: 0 });
		deepEqual(pt.getOffsetFromOrigin(), { x: 100, y: -100 }, "Offset correctly calculated");
	});
	
	
	test('isMatched()', function() {
		var point1 = new Point(null, 100, -100, { x: 0, y: 0 });
		var point2 = new Point(null, 0, 0, { x: 0, y: 0 });
		var point3 = new Point(null, 100, -100, { x: 0, y: 0 });
		var point4 = new Point(null, 100, -100, { x: 0, y: 0 });
		
		point1.setMatch(point2);
		point3.setMatch(point4);
		ok(!point1.isMatched(point2), "Points are not matched");
		ok(point3.isMatched(point4), "Points are matched");
	});
	
	test('isEqual()', function() {
		var pt = new Point(pc, 100, -100, { x: 0, y: 0 });
		var pt2 = new Point(pc, 100, -100, { x: 0, y: 0 });
		var pt3 = new Point(pc, 100, -100, { x: 10, y: 10 });
		var pt4 = new Point(pc, 10, 10, { x: 10, y: 10 });
		ok(pt.isEqual(pt2), "Points are equal");
		ok(!pt.isEqual(pt3), "Points are not equal");
		ok(!pt3.isEqual(pt4), "Points are not equal");
	});
	
}