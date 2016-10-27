/*
    globals require console
*/
var NetfluxSrv = require('./NetfluxWebsocketSrv');
var run = module.exports.run = function (store, wsSrv) {
    NetfluxSrv.run(store, wsSrv, { logToStdout: true });
};
