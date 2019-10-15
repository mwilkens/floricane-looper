/*!
 *  floop.js v0.1
 *
 *  (c) 2019, Mandy Wilkens
 *
 *  MIT License
 */

class Sample {
    constructor( sampleA, sampleB ) {

        //TODO: add option to skip sampleA
        // Sample A doesn't loop, just moves onto the next one
        this.a = new Howl({
            src: [sampleA]
        });

        // Sample B does loop
        this.b = new Howl({
            src: [sampleB],
            loop: true
        });

        // When sound A is finished playing, play B
        this.a.on('end', function(){
           this.b.play() 
        });

        this.currId = null
    }

    start(){
        // Just starts A, which will chain to B and loop
        while(this.a.state() == 'unloaded')
        this.currId = this.a.play()
    }

    fadeIn(){
        if(this.currId == null){
            this.currId.fade(0,1,30000);
        }
    }

    fadeOut(){
        if(this.currId != null){
            this.currId.fade(0,1,30000);
        }
    }
}

// Event Listener for Keypresses
document.addEventListener('keydown', function(event) {
    if (event.keyCode == 37) { // Left key
        alert('Left Key Was Pressed');
    }
    if (event.keyCode == 39) { // Right key
        alert('Right Key Was Pressed');
    }
    if (event.keyCode == 13) { // Enter key
        alert('Enter Key Was Pressed');
    }
    if (event.keyCode == 32) { // Space key
        alert('Space Key Was Pressed');
    }
});

// Object to define the states
var States = {
    'Off': 0,
    'Playing': 1,
    'Paused': 2
};

// Called when the page is loaded
function pageLoaded(){
}