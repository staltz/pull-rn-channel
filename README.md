# pull-rn-channel

_Convert a Node.js Mobile "channel" to a duplex pull-stream_

```
npm install --save pull-rn-channel
```

[Node.js Mobile for React Native](https://github.com/janeasystems/nodejs-mobile-react-native) uses "channels" for bidirectional communication between the JS UI thread and the JS backend (node.js) thread. These are basically EventEmitters, but have a `send(str)` method.

This package provides a way of building duplex pull streams from such channels.

## Usage

**frontend.js**

```js
var pull = require('pull');
var toDuplex = require('pull-rn-channel');
var nodejs = require('nodejs-mobile-react-native');

var stream = toDuplex(nodejs.channel);

pull(
  pull.values([20, 40, 60, 80]),
  stream,
  pull.drain(x => {
    console.log(x); // 2
                    // 4
                    // 6
                    // 8
  })
);
```

**backend.js**

```js
var pull = require('pull');
var toDuplex = require('pull-rn-channel');
var rn_bridge = require('rn-bridge');

var stream = toDuplex(rn_bridge.channel);

pull(
  stream,
  pull.map(x => x * 0.1),
  stream
);
```
