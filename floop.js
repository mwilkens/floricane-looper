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

    fadeIn(callback){
        if(this.currId == null){
            this.currId.fade(0,1,30000);
            this.currId.onfade = callback;
        }
    }

    fadeOut(callback){
        if(this.currId != null){
            this.currId.fade(0,1,30000);
            this.currId.onfade = callback;
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
            if(s.name == name)
                this.samples[i] = new Sample(s.samples.a, s.samples.b); // load in samples
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
        this.samples[this.currSampleIdx - 1].fadeOut(function(){
            this.samples[this.currSampleIdx].fadeIn();
        });
    }

    prev(){
        if(this.currSampleIdx > 0)
            this.currSampleIdx--;
        else
            return;
        this.samples[this.currSampleIdx + 1].fadeOut(function(){
            this.samples[this.currSampleIdx].fadeIn();
        });
    }

    pause(){
        this.state = States.Paused;
        this.samples[this.currSampleIdx + 1].fadeOut();
    }

    resume(){
        if(this.state != States.Paused){
            alert("Resumed when not paused!");
            return;
        }
        this.samples[this.currSampleIdx].fadeIn();
    }

    reset(){
        this.state = States.Off;
        this.samples[this.currSampleIdx].fadeOut();
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
    console.log("loaded");
    sl.load("irn girl");

    // Event Listener for Keypresses
    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 37) { // Left key
            sl.prev();
        }
        if (event.keyCode == 39) { // Right key
            sl.next();
        }
        if (event.keyCode == 13) { // Enter key
            sl.play();
        }
        if (event.keyCode == 32) { // Space key
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
            sl.reset();
        }
    });
}
window.onload = pageLoaded;