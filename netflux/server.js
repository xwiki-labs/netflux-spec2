const MAX_ID = 4294967295

// CloseEvent codes
const MESSAGE_TYPE_ERROR = 4000
const MESSAGE_UNKNOWN_ATTRIBUTE = 4001
const KEY_ALREADY_EXISTS = 4002
const KEY_UNKNOWN = 4003
const KEY_NO_LONGER_AVAILABLE = 4004

const keyHolders = new Set()

module.exports.run = function (webSocketSrv) {
    webSocketSrv.on('connection', function (socket) {
        socket.on('message', function (data) {
        var msg;
        try {
            msg = JSON.parse(data);
        } catch (event) {
            error(socket, MESSAGE_TYPE_ERROR, 'Server accepts only JSON string');
        }
        try {
            if ('key' in msg) {
                socket.send('{"isKeyOk":true}');
                socket.$connectingPeers = new Map();
                keyHolders.add(socket);
                socket.on('close', (code, errMsg) => {
                  keyHolders.delete(socket)
                  socket.$connectingPeers.forEach(s => {
                    s.close(KEY_NO_LONGER_AVAILABLE, `${msg.key} is no longer available`)
                  })
                })
          } else if ('id' in msg && 'data' in msg) {
            let connectingPeer = socket.$connectingPeers.get(msg.id)
            if (connectingPeer) {
              socket.$connectingPeers.get(msg.id).send(JSON.stringify({data: msg.data}))
            } else {
              console.log(`The peer ${msg.id} related to ${socket.$key} key could not be found`)
            }
          } else if ('join' in msg) {
              socket.send('{"isKeyOk":true}')
              socket.$keyHolder = keyHolders.values().next().value
              let peers = socket.$keyHolder.$connectingPeers
              let id = generateId(peers)
              peers.set(id, socket)
              socket.on('close', (code, errMsg) => {
                if (socket.$keyHolder.readyState === socket.OPEN) {
                  socket.$keyHolder.send(JSON.stringify({id, unavailable: true}))
                }
                peers.delete(id)
              })
              if ('data' in msg) {
                socket.$keyHolder.send(JSON.stringify({id, data: msg.data}))
              }
          } else if ('data' in msg) {
            if ('$keyHolder' in socket) {
              let id
              for (let [key, value] of socket.$keyHolder.$connectingPeers) {
                if (value === socket) {
                  id = key
                  break
                }
              }
              if (socket.$keyHolder.readyState === socket.OPEN) socket.$keyHolder.send(JSON.stringify({id, data: msg.data}))
            } else {
              console.log('The client has not been assigned yet to a keyHolder')
            }
          } else {
            error(socket, MESSAGE_UNKNOWN_ATTRIBUTE, 'Unknown JSON attribute: ' + data)
          }
        } catch (err) {
          error(socket, err.code, err.message)
        }
      })

      socket.on('error', err => console.log(`Socket ERROR: ${err}`))
    });
    console.log("server up");

    function error (socket, code, msg) {
      console.trace()
      console.log('Error ' + code + ': ' + msg)
      socket.close(code, msg)
    }

    function keyExists (key) {
      for (let h of keyHolders) if (h.$key === key) return true
      return false
    }

    function getKeyHolder (key) {
      for (let h of keyHolders) if (h.$key === key) return h
      return null
    }

    function generateId (peers) {
      let id
      do {
        id = Math.ceil(Math.random() * MAX_ID)
        if (peers.has(id)) continue
        break
      } while (true)
      return id
    }
}
