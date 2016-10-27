module.exports.run = function (webSocketSrv) {
    webSocketSrv.on('connection', function () {
        console.log("someone connected");
    });
    console.log("server up");
}
