$.fn.hideWhenComplete = function(){
    var timeout = 1000;
    var callback = function() { $(this).css('z-index',1); };
    return this.each(function(){
        var el 		= $(this),
            func 	= function(){ __check.call(this, el) },
            data 	= {	props: 	'src',
                        func: 	callback,
                        vals: 	'' };
        data.vals = el.attr(data.props);
        el.data(data);
        if (typeof (this.onpropertychange) == "object"){
            el.bind("propertychange", callback);
        } else if ($.browser.mozilla){
            el.bind("DOMAttrModified", callback);
        } else {
            setInterval(func, timeout);
        }
    });
    function __check(el) {
        var data 	= el.data(),
            changed = false,
            temp	= "";

            temp = el.attr(data.props);
            if(data.vals != temp){
                data.vals = temp;
                changed = true;
            }

        if(changed && data.func) {
            data.func.call(el, data);
        }
    }
};

$("#trexPuzzle").hideWhenComplete();