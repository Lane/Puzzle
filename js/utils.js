Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/** 
 * Constant for converting radians to degrees 
 * @name RAD2DEG
 * @global 
 */
var RAD2DEG = 180/Math.PI;


/** 
 * Constant for converting degrees to radians
 * @name DEG2RAD
 * @global 
 */
var DEG2RAD = 1/RAD2DEG;
