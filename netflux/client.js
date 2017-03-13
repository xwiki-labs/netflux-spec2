define([], function () {
    return {
        connect: function (webSocketURL) {
          console.log('Signaling URL = ' + webSocketURL)
            var wc = netflux.create({
                signalingURL: webSocketURL
            });
            return wc.join('azerty')
                .then(function () {
                    console.log('Joining "azerty"')
                    return {
                        webChannels: [],
                        getLag: function getLag() {
                            return 50;
                        },
                        sendto: function sendto(peerId, content) {
                            console.log('Sending |' + content + '| to ' + peerId)
                            wc.sendTo(String(peerId), content);
                            return Promise.resolve();
                        },
                        join: function join(chanId) {
                            // this is where we expect it to fail, not implemented yet.
                            return Promise.resolve({
                              id: String(wc.myId),
                              members: wc.members.map(function(peerId) {
                                return String(peerId)
                              }),
                              bcast: function (content) {
                                wc.send(content)
                                return Promise.resolve()
                              },
                              leave: function (reason) {
                                ws.leave()
                              },

                              on: function (eventName, cb) {
                                  switch (eventName) {
                                      case 'message':
                                          wc.onMessage = function (peerId, msg, isBroadcast) {
                                              if (isBroadcast) {
                                                  console.log('Broadcast Message |' + msg + '| from ' + peerId)
                                                  cb(msg, String(peerId));
                                              }
                                          }
                                          break;
                                      case 'join':
                                          wc.onPeerJoin = function (peerId) {
                                            console.log('Joined >' + peerId)
                                            cb(String(peerId))
                                          }
                                          break;
                                      case 'leave':
                                          wc.onPeerLeave = function (peerId) {
                                            console.log('Left >' + peerId)
                                            cb(String(peerId), 'with no reason')
                                          }
                                  }
                              }
                            })
                        },
                        on: function (eventName, cb) {
                            switch (eventName) {
                                case 'message':
                                    wc.onMessage = function (peerId, msg, isBroadcast) {
                                        if (!isBroadcast) {
                                            console.log('Personal message |' + msg + '| from ' + peerId)
                                            cb(msg, String(peerId));
                                        }
                                    }
                                    break;
                                case 'disconnect':
                                    // wc.onDisconnect = cb;
                                    // TODO: implement this event
                            }
                        }
                    }
                })
        }
    };
});
