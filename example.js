var audioContext = new AudioContext()
var bopper = require('./')(audioContext)

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
  {position: 7+2/3, length: 0.1},
  {position: 8, length: 0.1},
  {position: 9, length: 0.1},
  {position: 10, length: 0.1},
  {position: 11, length: 0.1},
  {position: 11.5, length: 0.1},
  {position: 12, length: 0.1},
  {position: 13, length: 0.1},
  {position: 14, length: 0.1},
  {position: 15, length: 0.1},
  {position: 15+1/3, length: 0.1},
  {position: 15+2/3, length: 0.1}
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

setTimeout(function(){
  bopper.start()
}, 500)
