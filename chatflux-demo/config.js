module.exports = {
    // Port to bind the nodejs server to
    port: 9000,

    // Address to bind the nodejs server to
    bindAddress: '::',

    // Corripsonds to the directory for the netflux implementation.
    netfluxImpl: 'netflux',

    // Executed on the client side, contains anything you need in order to construct a Network object.
    configureNetflux: function (NetFlux) {
        return NetFlux.connect((''+window.location.href).replace('http','ws').replace(/#.*$/, ''));
    }
};
