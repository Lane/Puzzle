	
	// Array Remove - By John Resig (MIT Licensed)
	Array.prototype.remove = function(from, to) {
	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);
	};
	
	// POINT OBJECT
	// --------------------------
	
	// Point constructor
	var Point = function() {
	    // Piece Data
	    this.item = this;
	    this.id = null;
	    this.radius = 0;
	    this.xPos = 0;
	    this.yPos = 0;
	    this.match = null;
	    this.parent = null
	}
	// Point functions
	Point.prototype = {
	    getPoint: function() {
	        return this.item;    
	    },
	    getParent: function() {
	        return this.parent;  
	    },
	    getDistanceFromMatch: function() {
	        return 0;    
	    },
	    isMatched: function() {
	        return true;
	    }
	}
	
	// PIECE OBJECT
	// --------------------------
	
	// Piece constructor
	var Piece = function() {
	    // Piece Data
	    this.id = null;
	    this.el = null;
	    this.width = 0;
	    this.height = 0;
	    this.angle = 0;
	    this.xPos = 0;
	    this.yPos = 0;
	    this.Points = null;
	}
	// Piece functions
	Piece.prototype = {
	    setData: function(item) {
	        this.id = item.id;
	        this.el = $("#"+item.id);
	        this.width = item.width;
	        this.height = item.height;
	        this.angle = item.angle;
	        this.xPos = item.xPos;
	        this.yPos = item.yPos;
	        this.Points = item.Points;
	    },
	    isSnapped: function() {
	        return false;  
	    },
	    makePiece: function() {
	        return false;
	    }
	}
	
	// PUZZLE OBJECT
	// --------------------------
	
	// Puzzle constructor
	var puzzleTest = function() {
	    
	    // Puzzle Data
	    this.canvas = $('#canvas');
	    this.debug = true;
	    this.Pieces = new Array();
	    
	}
	// Puzzle functions
	puzzleTest.prototype = {
	    addPiece: function(puzzlePiece) {
	        this.Pieces.push(puzzlePiece);
	        return true;
	    },
	    removePiece: function(puzzlePiece) {
	        for(var i=0; i<this.Pieces.length; i++)
	        {
	            if(puzzlePiece.id === this.Pieces[i].id)
	            {
	                this.Pieces.remove(i);
	                puzzlePiece.el.remove();
	                return true;
	            }
	        }
	        return false;
	    },
	    removeAllPieces: function() {
	        this.canvas.empty();
	    },
	    renderPieces: function() {
	        for(var i=0; i<this.Pieces.length; i++)
	        {
	             var p = this.Pieces[i];
	             $("#canvas").append(
	                 "<div id=\"" + p.id + "\" " +
	                 "class=\"piece\" style=\"width:" +
	                 p.width + "px;height:" + p.height +
	                 "px;top:" + p.yPos + "px;left:" + 
	                 p.xPos + "px;\"></div>"
	             );   
	        }
	    },
	    scramble: function() {
	        
	    },
	    toString: function() {
	            
	    }
	}


	var canvas, stage;

	var mouseTarget;	// the display object currently under the mouse, or being dragged
	var dragStarted;	// indicates whether we are currently in a drag operation
	var offset;
	var update = true;

	function init() {
		if (window.top != window) {
			document.getElementById("header").style.display = "none";
		}
		document.getElementById("loader").className = "loader";
		// create stage and point it to the canvas:
		canvas = document.getElementById("testCanvas");

		//check to see if we are running in a browser with touch support
		stage = new createjs.Stage(canvas);

		// enable touch interactions if supported on the current device:
		createjs.Touch.enable(stage);

		// enabled mouse over / out events
		stage.mouseEventsEnabled = true;
		stage.enableMouseOver();
		stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas
	

		// load the assets
		var head = new Image();
		head.src = "assets/head.png";
		head.onload = loadPuzzlePiece;
		
		var body = new Image();
		body.src = "assets/back.png";
		body.onload = loadPuzzlePiece;
		
		var leg1 = new Image();
		leg1.src = "assets/front-legs.png";
		leg1.onload = loadPuzzlePiece;
		
		var leg2 = new Image();
		leg2.src = "assets/back-legs.png";
		leg2.onload = loadPuzzlePiece;
		

	}

	function stop() {
		createjs.Ticker.removeEventListener("tick", tick);
	}

	function loadPuzzlePiece(event) {
		var image = event.target;
		var bitmap;
		var container = new createjs.Container();
		stage.addChild(container);
		
		bitmap = new createjs.Bitmap(image);
		container.addChild(bitmap);
		bitmap.x = canvas.width * Math.random()|0;
		bitmap.y = canvas.height * Math.random()|0;
		//bitmap.rotation = 360 * Math.random()|0;
		bitmap.regX = bitmap.image.width/2|0;
		bitmap.regY = bitmap.image.height/2|0;
		bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.5;
		bitmap.name = bitmap.image.src.split('/')[bitmap.image.src.split('/').length-1];


		// wrapper function to provide scope for the event handlers:
		(function(target) {
			bitmap.onPress = function(evt) {
				//console.log('onpress on:');
				//console.log(target);
				// bump the target in front of it's siblings:
				var offset = {x:target.x-evt.stageX, y:target.y-evt.stageY};
				
				target.filters = [new createjs.ColorFilter(1, 1, 0, 1)];
				target.cache(0, 0, target.image.width, target.image.height);
				target.updateCache();
				target.selected = true;
				update = true;
				// add a handler to the event object's onMouseMove callback
				// this will be active until the user releases the mouse button:
				evt.onMouseMove = function(ev) {
					target.x = ev.stageX+offset.x;
					target.y = ev.stageY+offset.y;
					// indicate that the stage should be updated on the next tick:
					update = true;
				}
				evt.onMouseUp = function(ev) {
				
					// Check if piece is in place, or if its points are within radius
					// of its match.
					// target.checkPiece();
					// console.log(ev);
				}
			}
			bitmap.onMouseOver = function() {
				//console.log('mouseover on:');
				//console.log(target);

				// highlight the piece
				target.filters = [new createjs.ColorFilter(0, 1, 0, 1)];
				target.cache(0, 0, target.image.width, target.image.height);
				target.updateCache();
				update = true;
			}
			bitmap.onMouseOut = function() {

				/*
				if(target.selected !== true) {
					target.filters = [new createjs.ColorFilter(1, 1, 1, 1)];
				}
				target.cache(0, 0, target.image.width, target.image.height);
				target.updateCache();
				*/
				update = true;
			}
			
		})(bitmap);
		
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", tick);
	}

	function tick(event) {
		// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
		if (update) {
			update = false; // only update once
			stage.update(event);
		}
	}