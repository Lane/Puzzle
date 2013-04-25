var queue = new createjs.LoadQueue();
 queue.addEventListener("complete", handleComplete);
 queue.loadManifest([
     "assets/head.png",
     "assets/back.png",
     "assets/back-legs.png",
     "assets/front-legs.png",
 ]);
 function handleComplete() {
     init();
 }