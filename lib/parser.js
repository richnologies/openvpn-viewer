'use strict';
var fs = require('fs');

const ICLBEGIN = 'Common Name,Real Address,Bytes Received,Bytes Sent,Connected Since'; // eslint-disable-line max-len
const ICLEND = 'ROUTING TABLE';

module.exports = {
  parse: parse
};

/**
 * Parse the OpenVPN status log file and returns an Object
 * representing the status of the VPN in a more convenient way
 *
 * @param {String} filename -- path to the log file
 * @return {Object} Description of the VPN status
 */
function parse(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, {encoding: 'utf-8'}, (err, log) => {
      if (err) {
        reject(err);
      } else {
        var lines = log.split('\n');
        var clients = [];
        var last = lines[1].split(',')[1];
        var iclBegin = lines.indexOf(ICLBEGIN) + 1;
        var iclEnd = lines.indexOf(ICLEND);
        var nclients = iclEnd - iclBegin;
        for (let i = iclBegin; i < iclEnd; i++) {
          var clientRow = lines[i].split(',');
          clients.push({
            name: clientRow[0],
            origin: clientRow[1],
            received: clientRow[2],
            sent: clientRow[3],
            since: clientRow[4]
          });
        }
        for (let j = iclEnd + 2; j < (iclEnd + nclients + 2); j++) {
          var route = lines[j].split(',');
          clients.forEach(client => { // eslint-disable-line no-loop-func
            if (client.name === route[1]) {
              client.ip = route[0];
              client.last = route[3];
            }
          });
        }
        resolve({
          time: last,
          n: nclients,
          clients: clients
        });
      }
    });
  });
}
