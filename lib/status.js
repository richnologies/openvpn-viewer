const EventEmitter = require('events').EventEmitter;
var chokidar = require('chokidar');
var parser = require('./parser');

class VPN extends EventEmitter {

  constructor(pathToStatusFile) {
    super();
    this._path = pathToStatusFile || process.env.STATUS_PATH || undefined;
    if (this._path) {
      this._status = undefined;
      this._watcher = chokidar.watch(this._path);
      this._watcher.on('change', this._update().bind(this));
    } else {

    }
    this._update();
  }

  numberOfConnectedClients() {
    return this._status.n;
  }

  lastUpdate() {
    return this._status.time;
  }

  getClientInfo(name) {
    this._status.forEach(client => {
      if (client.name === name) {
        return client;
      }
    });
  }

  _update() {
    parser
      .parse()
      .then(status => {
        this.emit('status', status);
        this._status = status;
      })
      .catch(err => console.log(err));
  }

}

module.exports = VPN;
