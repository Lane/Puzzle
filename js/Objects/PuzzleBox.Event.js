var PuzzleBox = PuzzleBox || {};

/** 
 * Represents an event that happens within the puzzle.
 *
 * @constructor
 * @param {Object} sender The object that is sending the event
 */
PuzzleBox.Event = function(sender) {
  this._sender = sender;
  this._listeners = [];
};

var ep = PuzzleBox.Event.prototype;

/**
 * Attaches a function to execute whenever this event is fired.
 * @method Event.attach
 * @param {Object} listener The function to attach to this event
 */
ep.attach = function (listener) {
	this._listeners.push(listener);
};

/**
 * Notifies this event that it has been fired, then executes each
 * of the functions that have been attached to this event.
 * @method Event.notify
 * @param {Object} args The arguments to pass to the listener functions
 */
ep.notify = function (args) {
  var index;

  for (index = 0; index < this._listeners.length; index += 1) {
  	this._listeners[index](this._sender, args);
  }
};