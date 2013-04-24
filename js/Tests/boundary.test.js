function boundary_tests() {

	module('Boundary.js');
	
	test('initialize()', function() {
		var bd = new Boundary(-100,-200,500,250);
		ok((bd.center.x == 150 && bd.center.y == -75), "Center point of the boundary correctly set");
		equal(bd.bottom, 50, "Bottom side of the boundary correctly set");
		equal(bd.right, 400, "Right side of the boundary correctly set");
	});
	
	test('isEqual()', function() {
		var boundaries = [
			new Boundary(0,0,500,200),
			new Boundary(-200,100,100,300),
			new Boundary(100,-350,500,200),
			new Boundary(0,0,300,200),
			new Boundary(0,0,500,200)
		];
		ok(!boundaries[0].isEqual(boundaries[1]), "Boundaries with different x/y an width/height are not equal");
		ok(!boundaries[0].isEqual(boundaries[2]), "Boundaries with same width/height but different x/y are not equal");
		ok(!boundaries[0].isEqual(boundaries[3]), "Boundaries with same x/y but different width/height are not equal");
		ok(boundaries[0].isEqual(boundaries[4]), "Boundaries with same x/y and same width/height are equal");
	});
	
	test('extendBoundary()', function() {
		var boundaries = [
			new Boundary(0,0,500,200),
			new Boundary(50,50,50,50),
			new Boundary(100,-350,250,300),
			new Boundary(-450,-450,150,50),
			new Boundary(-400,-100,550,150)
		];
		ok(
			boundaries[0].extendBoundary(boundaries[4]).isEqual({
				left:-400,
				top: -100,
				width: 900,
				height:300
			}),
			"Extending a boundary by another boundary has expected output"
		);
		ok(
			boundaries[4].extendBoundary(boundaries[0]).isEqual(
				boundaries[0].extendBoundary(boundaries[4])
			),
			"Source and destination boundary do not matter, output is the same regardless"
		);
		ok(
			boundaries[0].extendBoundary(boundaries[3]).isEqual({
				left:-450,
				top: -450,
				width: 950,
				height:650
			}),
			"Extending with a boundary located in a different quadrant has expected output"
		);
		ok(
			boundaries[0].extendBoundary(boundaries[1]).isEqual(boundaries[0]),
			"Extending with a boundary contained within another boundary returns the larger boundary."
		);
	});

}