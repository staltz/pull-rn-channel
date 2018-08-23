var EventEmitter = require('events');

function createSource() {
  var channel = new EventEmitter();
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'data', data: 10}));
  }, 20);
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'data', data: 20}));
  }, 40);
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'data', data: 30}));
  }, 60);
  setTimeout(function() {
    channel.emit('message', JSON.stringify({type: 'end'}));
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
    channel.emit('message', JSON.stringify({type: msg.type, data: y}));
  };
  return channel;
}

module.exports = {
  source: createSource,
  sink: createSink,
  transform: createTransform,
};
