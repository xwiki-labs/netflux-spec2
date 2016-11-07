define([], function () {
    return {
        connect: function (webSocketURL) {
            var wc = netflux.create({
              signaling: webSocketURL
            });
            return wc.open()
                .then(function () {
                    return wc.join('azerty')
                        .then(function () {
                            return {
                                webChannels: [],
                                getLag: function getLag() {
                                  return 50;
                                },
                                sendto: function sendto(peerId, content) {
                                    wc.sendTo(peerId, content);
                                    return Promise.resolve();
                                },
                                join: function join(chanId) { throw new Error("this is where we expect it to fail, not implemented yet.") },
                                on: function (eventName, cb) {
                                    switch (eventName) {
                                        case 'message':
                                            wc.onMessage = function (peerId, msg) {
                                                cb(msg, peerId);
                                            }
                                            break;
                                        case 'disconnect':
                                            wc.onDisconnect = cb;
                                    }
                                }
                            }
                        })
                })
        }
    };
});
