var EventEmitter = require('events');

function createReorderedSource() {
  var channel = new EventEmitter();
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'data', data: 30, seq: 3}));
  }, 20);
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'data', data: 10, seq: 1}));
  }, 40);
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'end', seq: 4}));
  }, 60);
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'data', data: 20, seq: 2}));
  }, 80);
  return channel;
}

function createSource() {
  var channel = new EventEmitter();
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'data', data: 10, seq: 1}));
  }, 20);
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'data', data: 20, seq: 2}));
  }, 40);
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'data', data: 30, seq: 3}));
  }, 60);
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'end', seq: 4}));
  }, 80);
  return channel;
}

function createSink(cb) {
  var channel = new EventEmitter();
  channel.send = function(raw) {
    cb(JSON.parse(raw));
  };
  return channel;
}

function createTransform() {
  var channel = new EventEmitter();
  channel.send = function(raw) {
    var msg = JSON.parse(raw);
    var x = msg.data;
    var y = x * 5;
    channel.emit(
      'message',
      JSON.stringify({type: msg.type, data: y, seq: msg.seq})
    );
  };
  return channel;
}

module.exports = {
  source: createSource,
  reorderedSource: createReorderedSource,
  sink: createSink,
  transform: createTransform,
};
