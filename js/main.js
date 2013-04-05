	
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
	};
	
	// PUZZLE PIECE OBJECT
	
	(function() {
	 
		var Piece = function(image, pContainer, scale) {
		  this.initialize(image, pContainer, scale);
		}
		var p = Piece.prototype = new createjs.Bitmap();
		
		p.containerName;
		p.imgSrc;
		p.points;
		 
		p.Bitmap_initialize = p.initialize;
		p.initialize = function(image, pContainer, scale) {
			// run bitmap constructor
		  this.Bitmap_initialize(image);
		  
		  // set parameters
		  this.regX = this.image.width/2|0;
		  this.regY = this.image.height/2|0;
		  this.scaleX = this.scaleY = this.scale = scale;
		  this.name = this.image.src.split('/')[this.image.src.split('/').length-1];
		  this.containerName = pContainer.name;
		  this.cursor = "pointer";
		  
		  // set event handlers
		  // this.addEventListener("mousedown", this.handleMouseDown);
		  // this.addEventListener("mousedown", this.handleMouseOver);
		  // this.addEventListener("mousedown", this.handleMouseOut);
		  
		  pContainer.addChild(this);
  		// addRotateHandle(this);
  		
  		if(debug) {
  			console.log('loaded piece:');
  			console.log(this);
  			console.log(pContainer);
  		}
		  
		}
		
		p.handleMouseDown = function() {
		
		}
		
		p.removeFromContainer = function() {
			// remove piece from container
		}
		
		p.addToContainer = function(container) {
			// logic that adds a piece to a container
		}
		
		p.switchContainer = function(container) {
			// logic that switches the current piece to a new container
		}
		 
		window.Piece = Piece;
		
	}());
		
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
	var selectedPiece = null;
	var update = true;
	var debug = true;

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
		stage.enableMouseOver(1000);
		stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas
	
		// check if hit
		stage.addEventListener("stagemousedown", function(evt) {
			var o = stage.getObjectUnderPoint(stage.mouseX, stage.mouseY);
			// if no objects were clicked
			if(o == null && selectedPiece != null) {
				deselectPiece();
				update = true;
			}
		});
	

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
		
		var rotator = new Image();
		rotator.src = "assets/rotate.png";
		//rotator.onload = loadRotateHandle;

	}

	function stop() {
		createjs.Ticker.removeEventListener("tick", tick);
	}
	
	function selectPiece(pc) {
		// add a yellow filter
		pc.filters = [new createjs.ColorFilter(1, 1, 0, 1)];
		pc.cache(0, 0, pc.image.width, pc.image.height);
		pc.updateCache();
				
		// make rotate handle visible
		pc.parent.getChildAt(1).visible = true;
		
		selectedPiece = pc; // update selectedPiece with new piece


		if(debug) {
			console.log('Selected Piece');
			console.log(selectedPiece);
		}
	}
	
	function deselectPiece() {
		// remove the color filter
		if(selectedPiece != null) {
			selectedPiece.parent.getChildAt(1).visible = false;
			selectedPiece.filters = [new createjs.ColorFilter(1, 1, 1, 1)];
			selectedPiece.cache(0, 0, selectedPiece.image.width, selectedPiece.image.height);
			selectedPiece.updateCache();
			selectedPiece = null;
			//rotateHandle.visible = false;
		}
		if(debug) {
			console.log('Deselected Piece');
		}
	}
	
	function addRotateHandle(pc) {
		var rotator = new Image();
		rotator.src = "assets/rotate.png";
		var bitmap;
		
		bitmap = new createjs.Bitmap(rotator);
		pc.parent.addChild(bitmap);
		bitmap.x = pc.x;
		bitmap.y = pc.y;
		
		//bitmap.rotation = 360 * Math.random()|0;
		bitmap.regX = bitmap.image.width/2|0;
		bitmap.regY = bitmap.image.height/2|0;
		bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.25;
		bitmap.name = 'bmp_rotator'+pc.id;
		bitmap.cursor = "pointer";
		bitmap.visible = false;
		
		bitmap.addEventListener("mousedown", function(evt) {
			var o = evt.target;
			var offset = {x:evt.stageX, y:evt.stageY};
			var start = pc.parent.rotation;
			
			pc.parent.regX = pc.x;
			pc.parent.regY = pc.y;
			
			// add a listener to the event object's mouseMove event
			// this will be active until the user releases the mouse button:
			evt.addEventListener("mousemove", function(ev) {
				pc.parent.rotation = start + ((ev.stageX-offset.x)+(ev.stageY-offset.y));
				//o.y = ev.stageY+offset.y;
				// indicate that the stage should be updated on the next tick:
				update = true;
			});
		});
	}
	
	// loadPuzzlePiece
	// ---------------------
	// - Creates a container
	// - Creates a bitmap, set parameters
	// - Add the bitmap to the container
	// - Set up event listeners
	// - Add the rotate handle
	function loadPuzzlePiece(event) {
		var image = event.target;
		var bitmap;
		var container = new createjs.Container();
		container.name = "container"+container.id;
		stage.addChild(container);
		
		bitmap = new Piece(image, container, 0.5);

		container.x = canvas.width * Math.random()|0;
		container.y = canvas.height * Math.random()|0;
		
		
		bitmap.addEventListener("mousedown", function(evt) {
			// bump the target in front of it's siblings:
			var o = evt.target;
			var c1 = stage.getChildByName(o.containerName);
			stage.addChild(c1);
			var offset = {x:c1.x-evt.stageX, y:c1.y-evt.stageY};
			
			// if user has selected a new piece
			if(o !== selectedPiece) {
				// remove selected status from old piece
				deselectPiece();

				// add selected status to new piece
				selectPiece(o);

				update = true;
			}
			
			// add a listener to the event object's mouseMove event
			// this will be active until the user releases the mouse button:
			evt.addEventListener("mousemove", function(ev) {
				c1.x = ev.stageX+offset.x;
				c1.y = ev.stageY+offset.y;
				// indicate that the stage should be updated on the next tick:
				update = true;
			});
		});

		bitmap.addEventListener("mouseover", function(evt) {
			var o = evt.target;
			if(o !== selectedPiece) {
				o.filters = [new createjs.ColorFilter(0, 1, 0, 1)];
				o.cache(0, 0, o.image.width, o.image.height);
				o.updateCache();
				update = true;
			}
		});

		bitmap.addEventListener("mouseout", function(evt) {
			var o = evt.target;
			if(o !== selectedPiece) {
				o.filters = [new createjs.ColorFilter(1, 1, 1, 1)];
				o.cache(0, 0, o.image.width, o.image.height);
				o.updateCache();
				update = true;
			}
			update = true;
		});

		//addRotateHandle(bitmap);
		
		if(debug) {
			console.log('loaded piece:');
			console.log(bitmap);
			console.log(container);
		}
		
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