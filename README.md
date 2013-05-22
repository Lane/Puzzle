# HTML5 Puzzle

Currently being developed for use in Udacity's Dino 101 MOOC.

   - [Documentation Index](http://lane.github.io/Puzzle/docs)
   - [Github](http://www.github.com/lane/Puzzle)
   - [Class Diagram](https://github.com/Lane/Puzzle/blob/master/docs/img/ClassDiagram.png)
   - [Development Preview](http://lane.github.io/Puzzle)
   - [Unit Tests](http://lane.github.io/Puzzle/test.html)
   
## Creating a Puzzle

To create a puzzle, create a new PuzzleBuilder and call the loadPuzzle function with a JSON Puzzle object.

    var loader = new PuzzleBuilder();
    loader.loadPuzzle(PuzzleObject);

### Puzzle JSON Object

At minimum, the Puzzle in JSON format will consist of the background, the pieces of the puzzle, and where the matches are made in the puzzle.  A match consists two points, and each point contains a piece and the x and y offset from the origin (center) of the piece where the points will connect with each other.

Here is a sample puzzle object:

    {
      background: { id : "background", src : "assets/background.jpg" },
      pieces: [
        { id: "piece1", src: "assets/piece1.png" },
        { id: "piece2", src: "assets/piece2.png" },
        { id: "piece3", src: "assets/piece3.png" }
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

    { id: "lower-jaw", 	name: "Lower Jaw", src: "assets/trex/LowRes/N-LowerJaw.png", hover: "assets/trex/LowRes/H-LowerJaw.png", selected: "assets/trex/LowRes/S-LowerJaw.png", zindex: 13 }
        					
  - **id**: The id for the piece
  - **name**: The display name for the piece
  - **hover**: The path to the image to use for the hover state of the piece
  - **selected**: The path to the image to use for the selected state of the piece
  - fixed: Set to true if the piece should be fixed in place.
  - x: The starting x position of the piece
  - y: The starting y position of the piece
  - scale: The amount to scale the piece image by
	
#### Matches

	[ 
		{ piece: "cervical", x: 29, 	y: 18 }, 	
		{ piece: "ribs", 	x: -70, 	y: -22} 
	]
		        					
  - **piece**: The id for the piece
  - **x**: The x offset from the center of the piece of the connecting point
  - **y**: The y offset from the center of the piece of the connecting point
    