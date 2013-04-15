function PieceContainer(overrides) {

	var options = overrides || {};
	
	this._pieces = options.pieces || new Array();
	this._selected = false;
	this._rotateHandle = new RotateHandle();
	this._puzzle = null;
	
	this.initialize(options);
	
	var _this = this;
		
	// Notify the puzzle of interaction events
	this.addEventListener("mouseover", function(event) { 
		_this._puzzle.mouseOverPiece.notify({ event: event, pieceContainer: _this});
	});
	
	this.addEventListener("mouseout", function(event) { 
		_this._puzzle.mouseOutPiece.notify({ event: event, pieceContainer: _this});
	});
	
	this.addEventListener("mousedown", function(event) {
	
		var pc = event.target;
		var offset = {x:pc.x-event.stageX, y:pc.y-event.stageY};
		var ob = pc.parent.getObjectUnderPoint(event.stageX, event.stageY);
		
		// if the user pressed down on a piece
		if(ob.type == "piece") {
			event.addEventListener("mousemove", function(evt) {
				evt.offset = offset;
				_this._puzzle.dragPiece.notify({ event: evt, pieceContainer: _this});
			});
		}
		
		// if the user pressed down on the rotate handle
		if(ob.type == "rotate-handle") {
			var start = ob.parent.rotation;
			offset = {x:event.stageX, y:event.stageY};
			event.addEventListener("mousemove", function(evt) {
				evt.offset = offset;
				evt.start = start;
				_this._puzzle.dragRotateHandle.notify({ event: evt, pieceContainer: _this});
			});
		}
		
		// check if any pieces match once the user lets go
		event.addEventListener("mouseup", function(evt) {
			_this._puzzle.releasePiece.notify({ event: evt, pieceContainer: _this});
		});
		
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
	this.regX = pc.image.width / 2 | 0;
	this.regY = pc.image.height / 2 | 0;
}

pc.getPieces = function () {
  return this._pieces;
}
	
pc.addPiece = function (p) {
  this._pieces.push(p);
  //this.addChild(p);
  this._puzzle.pieceAdded.notify({ piece : p });
  return this._pieces;
}

pc.movePiece = function(x,y) {
	this.x = x;
	this.y = y;
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
			//this.removeChild(p);
			this._pieces.remove(i);
			this._puzzle.pieceRemoved.notify({ piece : p });
			return this._pieces;
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

pc.getBoundingBox = function() {
	// DO THIS MONDAY
}

pc.matchPieces = function() {
	for(var i = 0; i < this._pieces.length; i++) {
		var matches = this._pieces[i].getMatches();
		for(var j = 0; j < matches.length; j++) {
		
			// get the piece we just connected	
			var otherPoint = matches[j]._point1;
			var thisPoint = matches[j]._point2;
			if(otherPoint.piece.parent.id == this.id) {
				otherPoint = matches[j]._point2;
				thisPoint = matches[j]._point1;
			}
			
			this._puzzle.connectAtPoints(matches[j]);

			if(debug) {
				console.log("matched point");
				console.log(matches[j]);
			}
		}
	}
}
	
pc.isSelected = function() {
	return this._selected;
}

pc.toString = function() {
	var pcString = "<h3>" + this.name + "</h3>"
		+ "<ul class='properties'>" 
		+ "<li><span>Position: </span>" + this.x + "," + this.y + "</li>"
		+ "<li><span>Rotation:</span>" + this.rotation + "</li>"
		+ "<li><span>Centre: </span>" + this.regX + "," + this.regY + "</li>"
		+ "<li>";
	for(var i = 0; i < this._pieces.length; i++) {
		pcString += this._pieces[i].toString();
	}
	pcString += "</li></ul>";
	
	// pcString += this._rotateHandle.toString();
	
	return pcString;
}