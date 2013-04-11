function Piece(imageSrc, overrides) {
	
	var tmpImg = new Image();
	tmpImg.src = imageSrc;
	
	this.initialize(tmpImg, overrides);
	
	var _this = this;
	
}
	
var p = Piece.prototype = new createjs.Bitmap();

p.Bitmap_initialize = p.initialize;
	
p.initialize = function(image, overrides) {

	var options = overrides || {};

	// create image bitmap constructor
  this.Bitmap_initialize(image);
  
  var _this = this;
  // set parameters
  image.onload = function() {
	  _this.regX = _this.image.width/2|0;
	  _this.regY = _this.image.height/2|0;
	  _this.name = _this.image.src.split('/')[_this.image.src.split('/').length-1];
	  _this.parent.parent._needsUpdate = true;
  }
  
  this.scaleX = this.scaleY = this.scale = options.scale || 1;
  this.x = options.x || 0;
  this.y = options.y || 0;
  this.type = "piece";
  
	if(debug) {
		console.log('Created Piece:');
		console.log(this);
	}
}
