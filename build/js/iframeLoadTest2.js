if(typeof(QL_player) !== 'undefined') {
    setInterval(function() {
        // Check if the user is in the Tyrannosaurus puzzle
        if(QL_player.mediaelement_media.currentTime > 730 
            && QL_player.mediaelement_media.paused) {
            setTimeout(function() { $('#trexPuzzle').css('z-index', 1); }, 15000); // show continue button after 15 seconds
        }
    }, 1000);
}



<script>
if(typeof(QL_player) !== 'undefined') {
    setInterval(function() {
        // Check if the user is in the Tyrannosaurus puzzle
        if(QL_player.mediaelement_media.currentTime > 730 
            && QL_player.mediaelement_media.paused) {
            setTimeout(function() { $('#trexPuzzle').css('z-index', 1); }, 15000); // show continue button after 15 seconds
        }
    }, 1000);
}
</script>