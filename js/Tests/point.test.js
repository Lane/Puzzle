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
	
	test('setOrigin()', function() {
		var pt = new Point(pc, 100, -100, { x: 0, y: 0 });
		pt.setOrigin({x: 100, y: 300});
		equal(pt.getRadius(), 400,"Radius correct after setting origin point to [100, 300]");
		equal(pt.getAngle(), 90,"Angle correct after setting origin point to [100, 300]");
		pt.setOrigin({x: -100, y: -300});
		equal(Math.round(pt.getRadius()), 283,"Radius correct after setting origin point to [-100, -300]");
		equal(pt.getAngle(), 315,"Angle correct after setting origin point to [-100, -300]");
		pt.setOrigin({x: 300, y: -100});
		equal(pt.getRadius(), 200,"Radius correct after setting origin point to [300, -100]");
		equal(pt.getAngle(), 180,"Angle correct after setting origin point to [300, -100]");
		pt.setOrigin({x: -600, y: 200});
		equal(Math.round(pt.getRadius()), 762,"Radius correct after setting origin point to [-600, 200]");
		equal(Math.round(pt.getAngle()), 23,"Angle correct after setting origin point to [-600, 200]");
	});
	
	test('getOffsetFromOrigin()', function() {
		var pt = new Point(pc, 100, -100, { x: 0, y: 0 });
		deepEqual(pt.getOffsetFromOrigin(), { x: 100, y: -100 }, "Offset correctly calculated");
		pt.setOrigin({x: -5000, y: 200 });
		deepEqual(pt.getOffsetFromOrigin(), { x: 5100, y: -300 }, "Offset correctly calculated");
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