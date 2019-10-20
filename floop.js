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

    // stops both samples and unloads them
    stop(){
        this.a.stop();
        this.b.stop();
        this.a.unload();
        this.b.unload();
    }

    // if either are playing, then this returns true
    playing(){
        return this.a.playing() || this.b.playing();
    }

    fadeIn(){
        if(this.a.playing()){
            this.a.fade(0,1,1000);
        } else {
            this.b.fade(0,1,1000);
        }
    }

    fadeOut(){
        if(this.a.playing()){
            // fade and pause when done
            this.a.fade(1,0,1000);
            this.a.once("fade", function(){
                this.a.pause();
            });
        } else {
            // fade and pause when done
            this.b.fade(1,0,1000);
            this.b.once("fade", function(){
                this.b.pause();
            });
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
        this.currSId = 0;
        this.isplaying = null;
        this.maxId = 0;
    }

    load(name){
        // cycle through each set
        for( var i = 0,s; s = this.data.sets[i]; i++){
            // if the name matches
            if(s.name == name){

                for(var j = 0,l; l = s.samples[j]; j++){
                    // Queue up the samples
                    // make sure that the ID is a number
                    if (typeof(l.id) == typeof(1)){
                        this.samples[l.id] = new Sample(l.a, l.b);
                        // Load them into memory
                        //this.samples[i].load();
                        console.log("Loading Sample a: ", l.a);
                        console.log("Loading Sample b: ", l.b);

                        // keep track of the largest ID
                        if( l.id > this.maxId){
                            this.maxId = l.id;
                        }
                    } else {
                        alert("Sample ID Error");
                    }
                }
            }
        }
    }

    play(){
        this.state = States.Playing;
        this.isplaying = this.samples[this.currSID];
        this.isplaying.start();
    }

    next(){
        if(this.currSId < this.maxId)
            this.currSId++;
        else
            return;

        crossfade(this.isplaying, this.samples[this.currSId]);
        this.isplaying = this.samples[this.currSId];
    }

    prev(){
        if(this.currSId > 0)
            this.currSId--;
        else
            return;

        crossfade(this.isplaying, this.samples[this.currSId]);
        this.isplaying = this.samples[this.currSId];
    }

    pause(){
        console.log("Pausing...");
        this.state = States.Paused;
        // pause all of them if they're playing
        for(var i=0,s;s=this.samples[i];i++){
            if(s.playing()){
                s.fadeOut();
            }
        }
    }

    resume(){
        console.log("Resuming...");
        if(this.state != States.Paused){
            alert("Resumed when not paused!");
            return;
        }
        this.state = States.Playing;
        this.isplaying.fadeIn();
    }

    reset(){
        console.log("Resetting");
        this.state = States.Off;
        this.samples[this.currSId].fadeOut();

        // stop all of the samples
        for(var i=0,s;s=this.samples[i];i++){
            s.stop();
        }

        this.currSId = 0;
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
        switch(event.keyCode){
            case 37: // Left Key
                console.log("Left Key Pressed...");
                sl.prev();
                break;
            case 39: // Right Key
                console.log("Right Key Pressed...");
                sl.next();
                break;
            case 13: // Enter Key
                console.log("Enter Key Pressed...");
                sl.play();
                break;
            case 32: // Space Key
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
                break;
            case 81: // Q Key
                console.log("Q Key Pressed...");
                sl.reset();
                break;
            default:
                break;
        }
    });

    console.log("All Loaded...");
}
window.onload = pageLoaded;