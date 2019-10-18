/*!
 *  floop.js v0.1
 *
 *  (c) 2019, Mandy Wilkens
 *
 *  MIT License
 */

// Allow for crossfade between two samples
var crossfade = function(enteringInstance, leavingInstance, fromBeginning=false, duration=1000) {

    if(fromBeginning){
        // Fade in entering instance
        enteringInstance.pos(0).play();
        enteringInstance.fade(0, 1, this.crossfadeDuration);
    }

    // Wait for the audio end to fade out entering instance
    // white fading in leaving instance
    setTimeout(function(){
        enteringInstance.fade(1, 0, this.crossfadeDuration);
        leavingInstance.pos(0).play();
        leavingInstance.fade(0, 1, this.crossfadeDuration);
    }, Math.floor(enteringInstance._duration * 1000) - this.crossfadeDuration);
}

class Sample {

    createSampleInstance = function(file, toloop=false){
        return new Howl({
            src: [file],
            volume: 0,
            loop: toloop,
            preload: false,
            onloaderror: function(id,e){
                console.log("Failed to load sample ", id);
                console.log("Error: ", e);
            }
        });
    }

    constructor( sampleA, sampleB ) {

        //TODO: add option to skip sampleA
        // Sample A doesn't loop, just moves onto the next one
        this.a = this.createSampleInstance(sampleA);

        // Sample B does loop
        this.b = this.createSampleInstance(sampleB, true);

        this.currSamp = null
    }

    start(){
        // Just starts A, which will chain to B and loop
        this.a.load();
        this.b.load();
        crossfade(this.a, this.b, true);
    }

    stop(){
        this.a.stop();
        this.b.stop();
        this.a.unload();
        this.b.unload();
    }

    fadeIn(callback){
        if(this.a.playing()){
            this.a.fade(0,1,1000);
            this.a.onfade = callback;
        } else {
            this.b.fade(0,1,1000);
            this.b.onfade = callback; 
        }
    }

    fadeOut(callback){
        if(this.a.playing()){
            this.a.fade(1,0,1000);
            this.a.onfade = callback;
        } else {
            this.b.fade(1,0,1000);
            this.b.onfade = callback; 
        }
    }
}

class Set {

    constructor(json){
        if(json != null) {
            this.data = json;
            this.samples = [];
        }
        else
            alert("No set data given...");

        this.state = States.Off;
        this.currSampleIdx = 0;
    }

    load(name){
        // cycle through each set
        for( var i = 0,s; s = this.data.sets[i]; i++){
            // if the name matches
            if(s.name == name){

                for(var j = 0,l; l = s.samples[j]; j++){
                    // Queue up the samples
                    this.samples[i] = new Sample(l.a, l.b);
                    // Load them into memory
                    //this.samples[i].load();
                    console.log("Loading Sample a: ", l.a);
                    console.log("Loading Sample b: ", l.b);
                }
            }
        }
    }

    play(){
        this.state = States.Playing;
        this.samples[this.currSampleIdx].start();
    }

    next(){
        if(this.currSampleIdx < this.samples.length)
            this.currSampleIdx++;
        else
            return;

        crossfade(this.samples[this.currSampleIdx-1],this.samples[this.currSampleIdx]);
    }

    prev(){
        if(this.currSampleIdx > 0)
            this.currSampleIdx--;
        else
            return;

        crossfade(this.samples[this.currSampleIdx+1],this.samples[this.currSampleIdx]);
    }

    pause(){
        console.log("Pausing...");
        this.state = States.Paused;
        this.samples[this.currSampleIdx].fadeOut();
    }

    resume(){
        console.log("Resuming...");
        if(this.state != States.Paused){
            alert("Resumed when not paused!");
            return;
        }
        this.state = States.Playing;
        this.samples[this.currSampleIdx].fadeIn();
    }

    reset(){
        console.log("Resetting");
        this.state = States.Off;
        this.samples[this.currSampleIdx].fadeOut();

        // stop all of the samples
        for(var i=0,s;s=this.samples[i];i++){
            s.stop();
        }

        this.currSampleIdx = 0;
    }
    
    get state(){
        return this._state;
    }
    
    set state(value){
        this._state = value;
    }
}

// Object to define the states
var States = {
    'Off': 0,
    'Playing': 1,
    'Paused': 2
};

// Called when the page is loaded
function pageLoaded(){
    var state = States.Off;
    var sl = new Set(sets);
    sl.load("irn girl");

    // Event Listener for Keypresses
    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 37) { // Left key
            console.log("Left Key Pressed...");
            sl.prev();
        }
        if (event.keyCode == 39) { // Right key
            console.log("Right Key Pressed...");
            sl.next();
        }
        if (event.keyCode == 13) { // Enter key
            console.log("Enter Key Pressed...");
            sl.play();
        }
        if (event.keyCode == 32) { // Space key
            console.log("Space Key Pressed...");
            if(sl.state == States.Playing){
                sl.pause();
            }
            else if (sl.state == States.Paused){
                sl.resume();
            }
            else {
                alert("Paused while looper is off.");
            }
        }
        if (event.keyCode == 81) { // q key
            console.log("Q Key Pressed...");
            sl.reset();
        }
    });

    console.log("All Loaded...");
}
window.onload = pageLoaded;