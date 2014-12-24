// var Readable = require('stream').Readable
var Stream = require('stream')

var inherits = require('util').inherits

module.exports = Bopper

function Bopper(audioContext){
  if (!(this instanceof Bopper)){
    return new Bopper(audioContext)
  }

  //Readable.call(this, { objectMode: true })
  Stream.call(this)
  this.readable = true
  this.writable = false

  this.context = audioContext
  var processor = this._processor = audioContext.createScriptProcessor(256, 1, 1)
  this._processor.onaudioprocess = bopperTick.bind(this)

  var tempo = 120
  var cycleLength = (1 / audioContext.sampleRate) * this._processor.bufferSize

  this._state = {
    lastTime: 0,
    lastPosition: 0,
    playing: false,
    bpm: tempo,
    beatDuration: 60 / tempo,
    increment: (tempo / 60) * cycleLength,
    cycleLength: cycleLength
  }

  processor.connect(audioContext.destination)
}

//inherits(Bopper, Readable)
inherits(Bopper, Stream)

var proto = Bopper.prototype

//proto._read = function(){
//  this._state.waiting = true
//}

proto.start = function(){
  this.lastTime = this.context.currentTime - this._state.cycleLength
  this._state.playing = true
}

proto.stop = function(){
  this._state.playing = false
}

proto.setTempo = function(tempo){
  var bps = tempo/60
  var state = this._state
  state.beatDuration = 60/tempo
  state.increment = bps * state.cycleLength
  state.bpm = tempo
  this.emit('tempo', state.bpm)
}

proto.getTempo = function(){
  return this._state.bpm
}

proto.isPlaying = function(){
  return this._state.playing
}

proto.setPosition = function(position){
  this._state.lastPosition = parseFloat(position) + (this._state.increment * 16)
}

proto.setSpeed = function(multiplier){
  var state = this._state

  multiplier = parseFloat(multiplier) || 0

  var tempo = state.bpm * multiplier
  var bps = tempo/60

  state.beatDuration = 60/tempo
  state.increment = bps * state.cycleLength
}


proto.getPositionAt = function(time){
  var state = this._state
  return state.lastPosition - ((state.lastTime - time) * state.increment) - (state.increment*12)
}

proto.getTimeAt = function(position){
  var state = this._state
  var positionOffset = this.getCurrentPosition() - position
  return this.context.currentTime - (positionOffset * state.beatDuration)
}

proto.getCurrentPosition = function(){
  return this.getPositionAt(this.context.currentTime)
}

proto.getNextScheduleTime = function(){
  var state = this._state
  return state.lastTime + (state.cycleLength*16)
}

proto.getBeatDuration = function(){
  var state = this._state
  return state.beatDuration
}

proto._schedule = function(time, from, to){
  var state = this._state
  //if (state.waiting){
    //state.waiting = false
    var duration = (to - from) * state.beatDuration
    if (time + state.cycleLength/2 >= this.context.currentTime){
      this.emit('data', {
        from: from,
        to: to,
        time: time,
        duration: duration,
        beatDuration: state.beatDuration
      })
    }
  //}
}

function bopperTick(e){
  var state = this._state
  var toTime = this.context.currentTime

  if (state.playing){
    var duration = toTime - state.lastTime
    var length = duration / state.beatDuration
    var position = state.lastPosition + length
    var lastPosition = state.lastPosition
    state.lastPosition = position
    this._schedule(state.lastTime + (state.cycleLength*16), lastPosition, position)
    
  }

  state.lastTime = toTime
}