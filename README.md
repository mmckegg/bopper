bopper
===

A streaming clock source for scheduling Web Audio events rhythmically.

## Install

```bash
$ npm install bopper
```

## Example

```js
var audioContext = new webkitAudioContext()
var bopper = require('bopper')(audioContext)

var playback = [
  {position: 0, length: 0.1},
  {position: 1, length: 0.1},
  {position: 2, length: 0.1},
  {position: 3, length: 0.1},
  {position: 3.5, length: 0.1},
  {position: 4, length: 0.1},
  {position: 5, length: 0.1},
  {position: 6, length: 0.1},
  {position: 7, length: 0.1},
  {position: 7+1/3, length: 0.1},
  {position: 7+2/3, length: 0.1}
]

// emits data roughly every 20ms

bopper.on('data', function(schedule){
  // schedule: from, to, time, beatDuration

  playback.forEach(function(note){
    if (note.position >= schedule.from && note.position < schedule.to){
      var delta = note.position - schedule.from
      var time = schedule.time + delta
      var duration = note.length * schedule.beatDuration
      play(time, duration)
    }
  })

})

function play(at, duration){
  var oscillator = audioContext.createOscillator()
  oscillator.connect(audioContext.destination)
  oscillator.start(at)
  oscillator.stop(at+duration)
}

bopper.setTempo(120)
bopper.start()

```

To run the example `npm install -g beefy` then `beefy example.js` and navigate to `http://localhost:9966/`