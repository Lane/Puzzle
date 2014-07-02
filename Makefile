coursera:
	@echo "Concatenating Javascript Files"
	@cat js/utils.js js/Objects/Event.js js/Objects/Boundary.js js/Objects/PieceContainer.js js/Objects/Piece.js js/Objects/Point.js js/Model/Puzzle.js js/View/PuzzleView.js js/Controller/PuzzleController.js > build/js/puzzle.js
	@echo "Minifying Puzzle Javascript"
	@uglifyjs -nc build/js/puzzle.js > build/js/puzzle.min.js

puzzlebox:
	@echo "Concatenating Javascript Files"
	@cat js/utils.js js/Objects/PuzzleBox.Event.js js/Objects/PuzzleBox.Boundary.js js/Objects/PuzzleBox.PieceContainer.js js/Objects/PuzzleBox.Piece.js js/Objects/PuzzleBox.Point.js js/Model/PuzzleBox.Puzzle.js js/View/PuzzleBox.PuzzleView.js js/Controller/PuzzleBox.PuzzleController.js > build/js/PuzzleBox.js
	@echo "Minifying Puzzle Javascript"
	@uglifyjs -nc build/js/PuzzleBox.js > build/js/PuzzleBox.min.js
	@cat credits.txt build/js/PuzzleBox.min.js > build/js/PuzzleBox-1.0.1.min.js