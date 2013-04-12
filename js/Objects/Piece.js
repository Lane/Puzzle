function Piece(imageSrc, overrides) {
	
	this._points = new Array();
	
	var tmpImg = new Image();
	tmpImg.src = imageSrc;
	
	this.initialize(tmpImg, overrides);
	
	var _this = this;
	
}
	
var p = Piece.prototype = new createjs.Bitmap();

p.Bitmap_initialize = p.initialize;
	
p.initialize = function(image, overrides) {

	var options = overrides || {};
	
	this._pointMatches = options.pointMatches || new Array();

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

p.removePointMatch = function(pm) {
	if(typeof(pm) == "object") {
		this.removePoint(pm._point1);
		this.removePoint(pm._point2);
		for(var i = 0; i < this._pointMatches.length; i++)
		{
			if((this._pointMatches[i]._point1 == pm._point1) 
						&& (this._pointMatches[i]._point2 == pm._point2)) {
				this._pointMatches.remove(i);
				if(debug) {
					console.log("point match removed");
				}
			}
		}
	}
}

p.addPointMatch = function(pm) {
	if(typeof(pm) == "object") {
		this._pointMatches.push(pm);
	}
}

p.addPoint = function(pt) {
	this._points.push(pt);
}

p.removePoint = function(pt) {
	for(var i = 0; i < this._points.length; i++)
	{
		if(this._points[i] == pt)
		{
			this._points.remove(i);
			return this._points;
		}
	}
	return false;
}

p.getMatches = function() {
	var matches = new Array();
	for(var i = 0; i < this._pointMatches.length; i++) {
		if(this._pointMatches[i].isMatched()) {
			matches.push(this._pointMatches[i]);
		}
	}
	return matches;
}
