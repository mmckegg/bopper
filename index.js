var Through = require('through')

module.exports = function(audioContext){

  var bopper = Through()
  var bpm = 120

  bopper.getPositionAt = function(time){
    var position = lastPosition - ((lastTime - time) * increment) - (increment*1.5)
    return position
  }

  bopper.getCurrentPosition = function(){
    return bopper.getPositionAt(audioContext.currentTime)
  }

  bopper.setTempo = function(tempo){
    var bps = tempo/60
    beatDuration = 60/tempo
    increment = bps * cycleLength

    bpm = tempo
  }

  bopper.setSpeed = function(multiplier){
    multiplier = multiplier || 0

    var tempo = bpm * multiplier
    var bps = tempo/60
    beatDuration = 60/tempo
    increment = bps * cycleLength
  }

  bopper.isPlaying = function(){
    return playing
  }

  bopper.restart = function(mod){
    if (mod){
      var position = nextPosition
      var bar = Math.floor(position / mod)
      nextPosition = (bar * mod) + mod
    } else {
      nextPosition = 0
    }
    playing = true
  }

  bopper.stop = function(){
    playing = false
  }

  bopper.start = function(){
    playing = true
  }


  var processor = audioContext.createJavaScriptNode(512, 1, 1)
  var cycleLength = (1 / audioContext.sampleRate) * processor.bufferSize


  // transport
  var playing = false

  // set by tempo
  var increment = 0
  var beatLength = 0

  // set by process
  var nextPosition = 0
  var positionTime = 0
  var lastFrame = -1


  function schedule(time, from, to){
    bopper.queue({
      from: from,
      to: to,
      time: time,
      beatDuration: beatDuration 
    })
  }

  function getBeatsFromTime(time){
    return time / beatDuration
  }

  var lastTime = 0
  var lastPosition = 0
  var offset = 0

  processor.onaudioprocess = function(e){
    var toTime = audioContext.currentTime
    var length = getBeatsFromTime(toTime - lastTime)

    if (playing){
      var position = lastPosition + length
      schedule(lastTime + (cycleLength*4), lastPosition, position)
      lastPosition = position
    }

    lastTime = toTime
  } 
  
  bopper.processor = processor
  processor.connect(audioContext.destination)

  bopper.setTempo(120)

  return bopper
}