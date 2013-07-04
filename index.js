var Through = require('through')

module.exports = function(audioContext){

  var bopper = Through()

  bopper.getPositionAt = function(time){
    var position = nextPosition - ((positionTime - time) * increment)
    return position
  }

  bopper.getCurrentPosition = function(){
    return bopper.getPositionAt(audioContext.currentTime)
  }

  bopper.setTempo = function(tempo){
    var bps = tempo/60
    beatTime = 60/tempo
    increment = bps * cycleLength
  }

  bopper.isPlaying = function(){
    return playing
  }

  bopper.restart = function(){
    nextPosition = 0
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

    }

  } 
  bopper.processor = processor
  processor.connect(audioContext.destination)

  bopper.setTempo(120)

  return bopper
}