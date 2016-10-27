define([], function () {
    return {
        connect: function (webSocketURL) {
            return new Promise(function (resolve, reject) {
                new WebSocket(webSocketURL); // just to make the server print a console.log
                resolve({
                    webChannels: [],
                    getLag: function getLag() { },
                    sendto: function sendto(peerId, content) { },
                    join: function join(chanId) { throw new Error("this is where we expect it to fail, not implemented yet.") },
                    on: function () { }
                });
            });
        }
    };
});
