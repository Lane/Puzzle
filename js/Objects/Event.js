function Event(sender) {
    this._sender = sender;
    this._listeners = [];
}

Event.prototype = {
    attach : function (listener) {
        this._listeners.push(listener);
    },
    notify : function (args) {
        var index;

        for (index = 0; index < this._listeners.length; index += 1) {
            this._listeners[index](this._sender, args);
        }
        
        if(debug) {
        	// puzzle to string
        	debugEl = document.getElementById("puzzleDebug");
        	debugEl.innerHTML = puzzle.toString();
        	
        	var eventItem = document.createElement("li");
        	var eventType = "unknown";
        	if(typeof(args.event) !== "undefined") {
        		eventType = args.event.type;
        	} else {
        		console.log("UNKNOWN EVENT:");
        		console.log(args);
        	}
        	eventItem.innerHTML = eventType + " event fired";
        	eventListEl = document.getElementById("eventList");
        	eventListEl.insertBefore(eventItem, eventListEl.childNodes[0]);
        }
    }
};