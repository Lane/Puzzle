var debug = { };

debug.warn = function(args) {
	console.log(arguments);
	return true;
}

debug.log = function() {
	return true;
}

debug.info = function(args) {
	console.log("INFO: " + args);
	return true;
}

debug.debug = function() {
	return true;
}