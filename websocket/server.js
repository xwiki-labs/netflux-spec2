/*
    globals require console
*/
var NetfluxSrv = require('./NetfluxWebsocketSrv');
var run = module.exports.run = function (wsSrv) {
    NetfluxSrv.run(undefined, wsSrv, { logToStdout: true });
};
