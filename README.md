# floricane-looper

Simple sound looper/player for floricane.

https://floricane.bandcamp.com/

## Design

Keys:

* Enter
    * Resets looper
    * Starts playback if reset
* Left
    * Plays next sample
* Right
    * Plays previous sample
* Space
    * Fades out if playing (30s)
    * Fades in if not playing (30s)

Possible States:

* Off
    * Keys possible:
        * Enter (begins software)
* Playing
    * Keys possible
        * Space (fades out 30s)
        * Left (fade in next sample)
        * Right (fade in prev sample)
* Paused
    * Keys possible
        * Space (fades out 30s)
        * Left (fade in next sample)
        * Right (fade in prev sample)

Loading Samples:

* Probably JSON, will allow for different sets