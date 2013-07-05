var Through = require('through')

module.exports = function(audioContext){

  var bopper = Through()
  var bpm = 120

  bopper.getPositionAt = function(time){
    var position = nextPosition - ((positionTime - time) * increment) - increment
    return position
  }

  bopper.getCurrentPosition = function(){
    return bopper.getPositionAt(audioContext.currentTime)
  }

  bopper.setTempo = function(tempo){
    var bps = tempo/60
    beatTime = 60/tempo
    increment = bps * cycleLength

    bpm = tempo
  }

  bopper.setSpeed = function(multiplier){
    multiplier = multiplier || 0

    var tempo = bpm * multiplier
    var bps = tempo/60
    beatTime = 60/tempo
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


  var processor = audioContext.createJavaScriptNode(1024, 1, 1)
  var cycleLength = (1 / audioContext.sampleRate) * processor.bufferSize


  // transport
  var playing = false

  // set by tempo
  var increment = 0
  var beatLength = 0

  // set by process
  var nextPosition = 0
  var positionTime = 0

  processor.onaudioprocess = function(e){

    if (playing){

      var position = nextPosition
      nextPosition += increment

      positionTime = audioContext.currentTime + cycleLength*2

      bopper.queue({
        from: position,
        to: position + increment,
        time: audioContext.currentTime + cycleLength*2,
        beatTime: beatTime 
      })

      var beat = Math.floor(position)
      if (position - beat < increment){
        bopper.emit('beat', beat)
      }
    }

  } 
  bopper.processor = processor
  processor.connect(audioContext.destination)

  bopper.setTempo(120)

  return bopper
}