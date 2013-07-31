# HTML5 Puzzle

Currently being developed for use in Udacity's Dino 101 MOOC.

   - [Documentation Index](http://lane.github.io/Puzzle/docs)
   - [Github](http://www.github.com/lane/Puzzle)
   - [Class Diagram](https://github.com/Lane/Puzzle/blob/master/docs/img/ClassDiagram.png)
   - [Development Preview](http://www.ualberta.ca/~lolson/puzzle/#tyrannosaurus)
   - [Unit Tests](http://lane.github.io/Puzzle/test.html)
   
## Creating a Puzzle

To create a puzzle, instantiate a new puzzle and pass the JSON Puzzle object representing the puzzle.

    var puzzle = new Puzzle(PuzzleObject);

### Puzzle JSON Object

At minimum, the Puzzle in JSON format will consist of the background, the pieces of the puzzle, and where the matches are made in the puzzle.  A match consists two points, and each point contains a piece and the x and y offset from the origin (center) of the piece where the points will connect with each other.

Here is a sample puzzle object:

	var PuzzleObject = {
	  background: { id : "background", src : "assets/background.jpg" },
	  hint: { id : "hint", src : "assets/hint.png" },
	  sounds: [
	  	{ id: "snap", mp3 : "assets/trex/sounds/thud.mp3", ogg : "assets/trex/sounds/thud.ogg" },
	  	{ id: "success", mp3 : "assets/trex/sounds/Dinosaur_Growl.mp3", ogg : "assets/trex/sounds/Dinosaur_Growl.ogg" }
	  ],
	  pieces: [
	    { id: "piece1", name: "Piece One", src: "assets/piece1.png", hover: "assets/piece1h.png", selected: "assets/piece1s.png" },
	    { id: "piece2", name: "Piece Two", src: "assets/piece2.png", hover: "assets/piece2h.png", selected: "assets/piece2s.png" },
	    { id: "piece3", name: "Piece Three", src: "assets/piece3.png", hover: "assets/piece3h.png", selected: "assets/piece3s.png" }
	  ],
	  matches: [
	    [ 
	      { piece: "piece1", x: -150, y: 0    }, 	
	      { piece: "piece2", x: -50,  y: -150 } 
	    ],
	    [ 
	      { piece: "piece1", x: 150, y: 0	  }, 	
	      { piece: "piece3", x: 0,   y: -100	} 
	    ]
	  ]
	};
    
### Entities

#### Background

	background: { id : "background", src : "assets/background.jpg" }

  - **id**: Value must be `background`
  - **src**: The path to the image to use for the background of the puzzle 

#### Hint

The hint is an overlay of the completed puzzle.  The user can request a hint, where it will temporarily show a low opacity layer of the completed puzzle.

	hint: { id : "hint", src : "assets/hint.png" }

  - **id**: Value must be `hint`
  - **src**: The path to the image to use for the puzzle hint
	
#### Sounds

The puzzle currently consists of two sound clips. One clip, `snap`, for when a piece "snaps" into place and another clip, `success`, for when the user has successfully completed the puzzle.  For cross platform support provide an MP3 and OGG of each sound clip.

	sounds: [
		{ id: "snap", mp3 : "assets/trex/sounds/thud.mp3", ogg : "assets/trex/sounds/thud.ogg" },
		{ id: "success", mp3 : "assets/trex/sounds/Dinosaur_Growl.mp3", ogg : "assets/trex/sounds/Dinosaur_Growl.ogg" }
	]
	
#### Pieces

The puzzle will contain several pieces. At minimum each piece will have an id, name, src, hover, and selected values as seen below:

	{ 
		id: "lower-jaw", 
		name: "Lower Jaw", 
		src: "assets/trex/LowRes/N-LowerJaw.png", 
		hover: "assets/trex/LowRes/H-LowerJaw.png", 
		selected: "assets/trex/LowRes/S-LowerJaw.png", 
	}
        					
  - **id**: The id for the piece
  - **name**: The display name for the piece
  - **src**: The path to the image to use for the neutral state of the piece
  - **hover**: The path to the image to use for the hover state of the piece
  - **selected**: The path to the image to use for the selected state of the piece
  - fixed: Set to true if the piece should be fixed in place.
  - x: The starting x position of the piece
  - y: The starting y position of the piece
  - scale: The amount to scale the piece image by
  - zindex: The z positioning of the element
	
#### Matches

In order to make the puzzle connect together, matches need to be set.  Each match consists of two points where the pieces will connect together.

	[ 
		{ piece: "cervical", x: 29, y: 18 }, 	
		{ piece: "ribs", x: -70, y: -22} 
	]
		        					
  - **piece**: The id for the piece
  - **x**: The x offset from the center of the piece of the connecting point
  - **y**: The y offset from the center of the piece of the connecting point
    
