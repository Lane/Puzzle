function RotateHandle(options) {
	this.initialize(options);
}
	
var r = RotateHandle.prototype = new createjs.Bitmap();

r.Bitmap_initialize = r.initialize;
	
r.initialize = function(options) {

	var handleImg = new Image();
	handleImg.src = "assets/rotate.png";

	// create image bitmap constructor
  this.Bitmap_initialize(handleImg);
  
  // set parameters
  this.name = "rotate-handle"+this.id;
  this.x = 0;
  this.y = 0;
  
  var rotateImage = this.image;
  var _this = this;
  handleImg.onload = function() {
	  _this.regX = rotateImage.width/2|0;
	  _this.regY = rotateImage.height/2|0;
  }
  this.scaleX = this.scaleY = this.scale = 0.25;
  this.type = "rotate-handle";
  this.visible = false;

	debug.log(this, 'Created rotate handle');
	
}