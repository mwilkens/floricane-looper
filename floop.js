/*!
 *  floop.js v0.1
 *
 *  (c) 2019, Mandy Wilkens
 *
 *  MIT License
 */

createSampleInstance = function(files, toloop=false){
    return new Howl({
        src: [files],
        volume: 0,
        html5: true,
        loop: toloop,
        preload: false,
        onload: function(){
            console.log("Loaded Sample");
        },
        onplay: function(id){
            console.log("Playing Sample with ID ", id);
            document.getElementById("file").innerHTML = files;
        },
        onplayerror: function(id,e) {
            console.log("Failed to play sample ", id);
            console.log("Error: ", e);
        },
        onpause: function(id){
            console.log("Pausing Sample with ID ", id);
        },
        onstop: function(id){
            console.log("Stopping Sample with ID ", id);
        },
        onloaderror: function(id,e){
            console.log("Failed to load sample ", id);
            console.log("Error: ", e);
        }
    });
}

class Set {

    constructor(json){
        if(json != null) {
            this.data = json;
            this.set = {};
        }
        else
            alert("No set data given...");

        this.state = States.Off;
        this.sID = 1; // start at sample 1
        this.sPlaying = null;
        this.filename;
        this.maxId = 0;
        this.fadeTime = 1000;
    }

    loadSamples(name){
        // cycle through each set
        for( var i = 0,s; s = this.data.sets[i]; i++)
            if(s.name == name) // match the set name
                this.set = s.samples;
    }

    // Scope closure function
    _s(s,cb){
        return function() {
            return cb(s);
        }
    }

    play(){
        this.state = States.Playing;

        // Set up some temp variables for scoping
        var fa = this.set[this.sID].a;
        var fb = this.set[this.sID].b;
        this.a = createSampleInstance(fa);
        this.b = createSampleInstance(fb, true);

        var self = this;

        // Load both of the samples
        this.a.load();
        this.b.load();

        this.sPlaying = this.a;
        this.filename = this.set[this.sID].a;
        console.log("Now Playing: ", this.filename);

        // once sample A is done loading, play it.
        this.a.once("load", function(){
            self.a.play();
            // fade in
            self.a.fade(0,1,self.fadeTime);
        });

        // once sample A is over, then play sample B
        this.a.once("end", function(){
            self.b.play();
            // fade in
            self.b.fade(0,1,self.fadeTime);
        });

        // once we're done, make sure B is playing
        this.b.once("play", function(){
            self.sPlaying = self.b;
            self.filename = self.set[self.sID].b;
            console.log("Now Playing: ", self.filename);
        });
    }

    stop(){
        // fade out previous sample
        this.sPlaying.fade(1,0,this.fadeTime);
        var s = this.sPlaying;
        this.sPlaying.once("fade", function(){
            s.stop();
            s.unload();
        });
    }

    next(){
        console.log("Next loop...");
        // check if sample id is in loop
        if(!( this.sID++ in this.set)){
            console.log("End of Set");
            // fade out the playing sample
            this.sPlaying.fade(1,0,this.fadeTime);
        }

        // stops current sample
        this.stop();

        // play next sample
        this.play();
    }

    prev(){
        // check if sample id is in loop
        if(!( this.sID-- in this.set)){
            console.log("End of Set");
            // fade out the playing sample
            this.sPlaying.fade(1,0,this.fadeTime);
        }

        // same as in next()
        this.stop();
        this.play();
    }

    pause(){
        // don't even bother if we're not playing
        if(!this.sPlaying.playing()) return;

        console.log("Pausing...");
        this.state = States.Paused;
        // pause all of them if they're playing
        this.sPlaying.fade(1,0,this.fadeTime);
        var s = this.sPlaying; // closure variable
        this.sPlaying.once("fade", function(){
            s.pause();
        });
    }

    resume(){
        // don't even bother if we're playing
        if(this.sPlaying.playing()) return;

        console.log("Resuming...");
        if(this.state != States.Paused){
            alert("Resumed when not paused!");
            return;
        }
        this.state = States.Playing;
        this.sPlaying.play();
        this.sPlaying.fade(0,1,this.fadeTime);
    }

    reset(){
        console.log("Resetting");
        this.state = States.Off;

        // stop all of the samples
        this.sPlaying.stop();
        this.sPlaying.unload();

        this.sID = 1;
        document.getElementById("file").innerHTML = "";
    }
    
    get state(){
        return this._state;
    }
    
    set state(value){
        this._state = value;
        document.getElementById("status").innerHTML = Object.keys(States)[this._state];
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
    sl.loadSamples("irn girl");

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