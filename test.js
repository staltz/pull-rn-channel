var pull = require('pull-stream');
var test = require('tape');
var toDuplex = require('./index');
var mock = require('./mock');

test('works as source pull-stream', function(t) {
  var sourceChannel = mock.source();

  var clientStream = toDuplex(sourceChannel);
  pull(
    clientStream,
    pull.collect(function(err, arr) {
      t.error(err, 'no error happened');
      t.deepEqual(arr, [10, 20, 30], 'data is [10,20,30]');
      t.end();
    }),
  );
});

test('works as a sink pull-stream', function(t) {
  t.plan(4);
  var expected = [
    {type: 'data', format: 'json', data: 10},
    {type: 'data', format: 'json', data: 20},
    {type: 'data', format: 'json', data: 30},
    {type: 'end'},
  ];
  var sinkChannel = mock.sink(function(x) {
    t.deepEqual(x, expected.shift());
  });

  var clientStream = toDuplex(sinkChannel);
  pull(pull.values([10, 20, 30]), clientStream);
});

test('works as a transform pull-stream', function(t) {
  var sinkChannel = mock.transform();

  var clientStream = toDuplex(sinkChannel);
  pull(
    pull.values([1, 2, 3]),
    clientStream,
    pull.collect(function(err, arr) {
      t.error(err, 'no error happened');
      t.deepEqual(arr, [5, 10, 15], 'data is [5,10,15]');
      t.end();
    }),
  );
});
