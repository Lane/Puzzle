var boundaries = [
	new Boundary(0,0,500,200),
	new Boundary(-200,100,100,300),
	new Boundary(100,-350,250,300),
	new Boundary(-450,-450,150,50),
	new Boundary(-400,-100,550,150)
];

module('Boundary.js');
test('extendBoundary()', function() {
	equal(
		boundaries[0].extendBoundary(boundaries[4]),
		boundaries[4].extendBoundary(boundaries[0]),
		"Extended boundaries equal each other"
	);
});

console.log(boundaries[0]);
console.log(boundaries[4].extendBoundary(boundaries[0]));