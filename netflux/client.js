define([], function () {
    return {
        connect: function (webSocketURL) {
            var wc = netflux.create({
                signalingURL: webSocketURL
            });
            return wc.join('azerty')
                .then(function () {
                    return {
                        webChannels: [],
                        getLag: function getLag() {
                            return 50;
                        },
                        sendto: function sendto(peerId, content) {
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
                                                  cb(msg, String(peerId));
                                              }
                                          }
                                          break;
                                      case 'join':
                                          wc.onPeerJoin = function (peerId) {
                                            cb(String(peerId))
                                          }
                                          break;
                                      case 'leave':
                                          wc.onPeerLeave = function (peerId) {
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
