
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
  this.scaleX = this.scaleY = this.scale = 0.25;
  this.type = "rotate-handle";
  this.visible = false;
  
  this.addEventListener("mousedown", function(evt) {
  	var o = evt.target;
  	var offset = {x:evt.stageX, y:evt.stageY};
  	var start = o.parent.rotation;
  	
  	o.parent.regX = o.x;
  	o.parent.regY = o.y;
  	
  	// add a listener to the event object's mouseMove event
  	// this will be active until the user releases the mouse button:
  	evt.addEventListener("mousemove", function(ev) {
  		o.parent.rotation = start + ((ev.stageX-offset.x)+(ev.stageY-offset.y));
  		//o.y = ev.stageY+offset.y;
  		// indicate that the stage should be updated on the next tick:
  		update = true;
  	});
  });
	
	if(debug) {
		console.log('Created rotate handle:');
		console.log(this);
	}
  
}