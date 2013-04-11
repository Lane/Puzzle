function PieceContainer(overrides) {

	var options = overrides || {};
	
	this._pieces = options.pieces || new Array();
	this._selected = false;
	this._rotateHandle = new RotateHandle();
	
	// model events
	this.pieceAdded = new Event(this);
	this.pieceRemoved = new Event(this);
	
	// view events
	this.mouseOverPiece = new Event(this);
	this.mouseOutPiece = new Event(this);
	this.dragPiece = new Event(this);
	this.dragRotateHandle = new Event(this);
		
	this.initialize(options);
	
	var _this = this;
	
	// handle events for PieceContainer (Controller)
	this.mouseOverPiece.attach(function() {
		_this.hoverPiece();
	});
	
	this.mouseOutPiece.attach(function() {
		_this.resetPiece();
	});
	
	this.dragPiece.attach(function(sender, args) {
		_this.movePiece(args);
	});
	
	this.dragRotateHandle.attach(function(sender, args) {
		_this.rotatePiece(args);
	});
	
	// Notify interaction events (View)
	this.addEventListener("mouseover", function(event) { 
		_this.mouseOverPiece.notify();
	});
	
	this.addEventListener("mouseout", function(event) { 
		_this.mouseOutPiece.notify();
	});
	
	this.addEventListener("mousedown", function(event) {
		var pc = event.target;
		var offset = {x:pc.x-event.stageX, y:pc.y-event.stageY};
		var ob = pc.parent.getObjectUnderPoint(event.stageX, event.stageY);
		if(ob.type == "piece") {
			event.addEventListener("mousemove", function(evt) {
				evt.offset = offset;
				_this.dragPiece.notify(evt);
			});
		}
		if(ob.type == "rotate-handle") {
			var start = ob.parent.rotation;
			offset = {x:event.stageX, y:event.stageY};
			event.addEventListener("mousemove", function(evt) {
				evt.offset = offset;
				evt.start = start;
				_this.dragRotateHandle.notify(evt);
			});
		}
	});
}

var pc = PieceContainer.prototype = new createjs.Container();
pc.Container_initialize = pc.initialize;
	
pc.initialize = function(options) {
	this.Container_initialize();
	
	// set parameters
	this.name = options.name || "container"+this.id;
	this.cursor = options.cursor || "pointer";
	this.x = options.x || 250;
	this.y = options.x || 250;
	this.selected = false;
	this.type = "piece-container";
	this.addChild(this._rotateHandle);
	//this.setCentre();
	
}

pc.setCentre = function() {
	var topLeft = 0;
	var bottomRight = 0;
	var pc;
	pc = this._pieces[0];
	this.regX = pc.image.width / 4 | 0;
	this.regY = pc.image.height / 4 | 0;
}

pc.getPieces = function () {
  return this._pieces;
}
	
pc.addPiece = function (p) {
  this._pieces.push(p);
  this.pieceAdded.notify({ piece : p });
}

pc.movePiece = function(e) {
	this.x = e.stageX+e.offset.x;
	this.y = e.stageY+e.offset.y;
	this.parent._needsUpdate = true;
}

pc.rotatePiece = function(e) {
	this.rotation = e.start + ((e.stageX-e.offset.x)+(e.stageY-e.offset.y));
	this.parent._needsUpdate = true;
}
	
pc.removePiece = function (p) {
	for(var i = 0; i < this._pieces.length; i++) {
		if(this._pieces[i].id == p.id)
		{
			this._pieces.remove(i);
			this.pieceRemoved.notify({ piece : p });
			return true;
		}
	}
	return false;
}

pc.selectPiece = function() {
	this.addChild(this._rotateHandle);
	this._selected = true;
	this._rotateHandle.visible = true;
	this.parent.addChild(this);
	this.filters = [new createjs.ColorFilter(1, 1, 0, 1)];
	this.cache(-600, -400, 1200, 800);
	this.updateCache();
	this.parent._needsUpdate = true;
}
	
pc.hoverPiece = function() {
	if(!this._selected) {
		this.filters = [new createjs.ColorFilter(0, 1, 0, 1)];
		this.cache(-600, -400, 1200, 800);
		this.updateCache();
		this.parent._needsUpdate = true;
		//this.pieceContainerSelected.notify({ piece : this });
	}
}
	
pc.resetPiece = function(force) {
	force = typeof force !== 'undefined' ? force : false;
	if(!this._selected || force) {
		this._selected = false;
		this._rotateHandle.visible = false;
		this.filters = [];
		this.cache(-600, -400, 1200, 800);
		this.updateCache();
		this.parent._needsUpdate = true;
		//this.pieceContainerDeselected.notify({ piece : this });
	}
}
	
pc.isSelected = function() {
	return this._selected;
}