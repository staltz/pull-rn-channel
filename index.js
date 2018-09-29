var quickInsert = require('quick-insert');

module.exports = function toDuplex(channel) {
  var buffer = [];
  var cbs = [];
  var isReceiving = false;
  var outSeq = 0;
  var waitingForInSeq = 1;
  var isSending = false;

  function close() {
    setTimeout(function tryToClose() {
      if (!isReceiving && !isSending) {
        if (channel.removeListener) {
          channel.removeListener('message', onMsg);
        } else if (channel.off) {
          channel.off('message', onMsg);
        }
      } else {
        setTimeout(tryToClose);
      }
    });
  }

  function consumeReads() {
    var cb, msg;
    while (buffer.length && cbs.length && buffer[0].seq === waitingForInSeq) {
      msg = buffer.shift();
      cb = cbs.shift();
      waitingForInSeq += 1;
      switch (msg.type) {
        case 'data':
          if (msg.format === 'buffer') {
            cb(null, Buffer.from(msg.data, 'base64'));
          } else {
            cb(null, msg.data);
          }
          break;

        case 'error':
          cb(msg.data);
          isReceiving = false;
          close();
          return;

        case 'end':
          cb(true);
          isReceiving = false;
          close();
          return;

        default:
          (console.warn | console.log)(
            'pull-rn-channel cannot recognize message',
            msg
          );
          break;
      }
    }
  }

  function onMsg(raw) {
    const msg = JSON.parse(raw);
    quickInsert(msg, buffer, function(m1, m2) {
      if (m1.seq === m2.seq) return 0;
      return m1.seq < m2.seq ? -1 : 1;
    });
    consumeReads();
  }

  if (channel.addListener) {
    channel.addListener('message', onMsg);
  } else if (channel.on) {
    channel.on('message', onMsg);
  } else {
    throw new Error(
      'pull-rn-channel cannot call neither `on` nor `addListener`'
    );
  }

  function read(abort, cb) {
    isReceiving = true;
    if (!cb) throw new Error('*must* provide cb to pull-rn-channel source');
    if (abort) {
      while (cbs.length) {
        cbs.shift()(abort);
      }
      cb(abort);
      isReceiving = false;
      close();
    } else {
      cbs.push(cb);
      consumeReads();
    }
  }

  function write(read) {
    isSending = true;
    read(null, function next(end, data) {
      outSeq += 1;
      if (end === true) {
        channel.send(JSON.stringify({type: 'end', seq: outSeq}));
        isSending = false;
        close();
      } else if (end) {
        channel.send(JSON.stringify({type: 'error', data: end, seq: outSeq}));
        isSending = false;
        close();
      } else {
        const send = Buffer.isBuffer(data) ? data.toString('base64') : data;
        const format = Buffer.isBuffer(data) ? 'buffer' : 'json';
        const payload = {type: 'data', format, data: send, seq: outSeq};
        channel.send(JSON.stringify(payload));
        read(null, next);
      }
    });
  }

  return {
    source: read,
    sink: write,
  };
};
