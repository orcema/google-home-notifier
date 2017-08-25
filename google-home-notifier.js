var Client = require('castv2-client').Client;
const EventEmitter = require('events');
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var Googletts = require('google-tts-api');
class MyEmitter extends EventEmitter {}

function GoogleHomeNotifier(deviceip, language, speed) {

  this.deviceip = deviceip;
  this.language = language;
  this.speed = speed;


  const emitter = new MyEmitter();
  // this.emitters       = [ this ];


  this.notify = function (message, callback) {
    getSpeechUrl(message, this.deviceip, function (res) {
      emitter.emit("speech", res);
    });
  };

  this.play = function (mp3_url, callback) {
    getPlayUrl(mp3_url, this.deviceip, function (res) {
      emitter.emit("play", res)
    });
  };

  var getSpeechUrl = function (text, host, callback) {
    Googletts(text, language, this.speed).then(function (url) {
      onDeviceUp(host, url, function (res) {
        callback(res);
      });
    }).catch(function (err) {
      emitter.emit("error", err);
    });
  };

  var getPlayUrl = function (url, host, callback) {
    onDeviceUp(host, url, function (res) {
      callback(res);
    });
  };

  var onDeviceUp = function (host, url, callback) {
    var client = new Client();
    client.connect(host, function () {
      client.launch(DefaultMediaReceiver, function (err, player) {
        var media = {
          contentId: url,
          contentType: 'audio/mp3',
          streamType: 'BUFFERED' // or LIVE
        };
        player.load(media, {
          autoplay: true
        }, function (err, status) {
          client.close();
          callback('Device notified');
        });
      });
    });

    client.on('error', function (err) {
      console.log('Error: %s', err.message);
      client.close();
      emitter.emit("error", err)
    });
  };
}

GoogleHomeNotifier.prototype.__proto__ = EventEmitter.prototype // inherit from EventEmitter

module.exports = function (deviceip, language, speed) {
  if (deviceip && language) {
    if (!speed) {
      speed = 1
    };
    return new GoogleHomeNotifier(deviceip, language, speed);
  }
}
