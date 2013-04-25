var puzzle,pieceContainer1,pieceContainer2,piece1,piece2,point,point2;

var _pieces = new Array();
var _points = [ new Point(null, 100, 0, { x: 0, y: 0 }), new Point(null, 150, -50, { x: 0, y: 0 }) ]
var _containers = new Array();

function setup() {

	var queue = new createjs.LoadQueue();
	 queue.addEventListener("complete", handleComplete);
	 queue.addEventListener("fileload", handleFileLoad);
	 queue.loadManifest([
	     { id: "head", src: "assets/head.png" },
	     { id: "back", src: "assets/back.png" },
	     { id: "back-legs", src: "assets/back-legs.png" },
	     { id: "front-legs", src: "assets/front-legs.png" }
	 ]);
	 
	 
	function handleFileLoad(event) {
		var item = event.item; // A reference to the item that was passed in
		var type = item.type;
		if (type == createjs.LoadQueue.IMAGE) {
			//console.log(event);
			_pieces.push(new Piece({img:event.result}));
		}
	}
	 
	function handleComplete() {
		boundary_tests();
		point_tests();
		piece_tests();
	}
	
}