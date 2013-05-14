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