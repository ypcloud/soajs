'use strict';

var connect = require('connect');
var http = require('http');
var request = require('request');
var url = require('url');
var core = require('./../modules/soajs.core/index.js');

var favicon_mw = require('./../mw/favicon/index');
var cors_mw = require('./../mw/cors/index');
var soajs_mw = require('./../mw/soajs/index');
var response_mw = require('./../mw/response/index');
var awareness_mw = require('./../mw/awareness/index');
var controller_mw = require('./../mw/controller/index');

var autoRegHost = process.env.SOAJS_SRV_AUTOREGISTERHOST || true;
if (autoRegHost && typeof(autoRegHost) !== 'boolean') {
    autoRegHost = (autoRegHost === 'true');
}

/**
 *
 */
function controller(param) {
    var _self = this;
    _self.awareness = true;
    _self.serviceName = "controller";
    _self.serviceVersion = 1;
    _self.serviceIp = process.env.SOAJS_SRVIP || null;
    _self.serviceHATask = null;
}

controller.prototype.init = function (callback) {
    var _self = this;
    var fetchedHostIp = null;
    var serviceIpNotDetected = false;
    if (!autoRegHost) {
        _self.serviceIp = '127.0.0.1';
    }
    if (!_self.serviceIp) {
        core.getHostIp(function (getHostIpResponse) {
            fetchedHostIp = getHostIpResponse;
            if (fetchedHostIp && fetchedHostIp.result) {
                _self.serviceIp = fetchedHostIp.ip;
                if (fetchedHostIp.extra && fetchedHostIp.extra.swarmTask) {
                    _self.serviceHATask = fetchedHostIp.extra.swarmTask;
                }
            } else {
                serviceIpNotDetected = true;
                _self.serviceIp = "127.0.0.1";
            }
            resume();
        });
    }
    else {
        resume();
    }
    function resume() {
        core.registry.load({
            "serviceName": _self.serviceName,
            "serviceVersion": _self.serviceVersion,
            "apiList": null,
            "awareness": _self.awareness,
            "serviceIp": _self.serviceIp
        }, function (reg) {
            _self.registry = reg;
            _self.log = core.getLogger(_self.serviceName, _self.registry.serviceConfig.logger);
            if (fetchedHostIp) {
                if (!fetchedHostIp.result) {
                    _self.log.warn("Unable to find the service host ip. The service will NOT be registered for awareness.");
                    _self.log.info("IPs found: ", fetchedHostIp.extra.ips);
                    if (serviceIpNotDetected) {
                        _self.log.warn("The default service IP has been used [" + _self.serviceIp + "]");
                    }
                }
                else {
                    _self.log.info("The IP registered for service [" + _self.serviceName + "] awareness : ", fetchedHostIp.ip);
                }
            }

            var app = connect();
            app.use(favicon_mw());
            app.use(soajs_mw({
                "serviceName": _self.serviceName,
                "log": _self.log
            }));
            app.use(cors_mw());
            app.use(response_mw({"controllerResponse": true}));
            app.use(awareness_mw({
                "awareness": _self.awareness,
                "serviceName": _self.serviceName,
                "log": _self.log,
                "serviceIp": _self.serviceIp
            }));
            app.use(controller_mw());
            app.use(function (req, res, next) {

                setImmediate(function () {
                    req.soajs.controller.gotoservice(req, res, null);
                });

                req.on("error", function (error) {
                    req.soajs.log.error("Error @ controller:", error);
                    if (req.soajs.controller.redirectedRequest) {
                        req.soajs.controller.redirectedRequest.abort();
                    }
                });

                req.on("close", function () {
                    if (req.soajs.controller.redirectedRequest) {
                        req.soajs.log.info("Request aborted:", req.url);
                        req.soajs.controller.redirectedRequest.abort();
                    }
                });
            });

            _self.server = http.createServer(app);
            _self.serverMaintenance = http.createServer(function (req, res) {
                if (req.url === '/favicon.ico') {
                    res.writeHead(200, {'Content-Type': 'image/x-icon'});
                    return res.end();
                }
                var parsedUrl = url.parse(req.url, true);
                var response;
                var maintenanceResponse = function (req, route) {
                    var response = {
                        'result': false,
                        'ts': Date.now(),
                        'service': {
                            'service': _self.serviceName.toUpperCase(),
                            'type': 'rest',
                            'route': route || parsedUrl.pathname
                        }
                    };
                    return response;
                };
                var reloadRegistry = function () {
                    core.registry.reload({
                        "serviceName": _self.serviceName,
                        "serviceVersion": null,
                        "apiList": null,
                        "awareness": _self.awareness,
                        "serviceIp": _self.serviceIp
                    }, function (err, reg) {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        response = maintenanceResponse(req);
                        if (err) {
                            _self.log.warn("Failed to load registry. reusing from previous load. Reason: " + err.message);
                        } else {
                            response['result'] = true;
                            response['data'] = reg;
                        }
                        return res.end(JSON.stringify(response));
                    });
                };
                if (parsedUrl.pathname === '/reloadRegistry') {
                    reloadRegistry();
                }
                else if (parsedUrl.pathname === '/awarenessStat') {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    var tmp = core.registry.get();
                    response = maintenanceResponse(req);
                    if (tmp && (tmp.services || tmp.daemons)) {
                        response['result'] = true;
                        response['data'] = {"services": tmp.services, "daemons": tmp.daemons};
                    }
                    return res.end(JSON.stringify(response));
                }
                else if (parsedUrl.pathname === '/register') {
                    if (parsedUrl.query.serviceHATask) {
                        reloadRegistry();
                    }
                    else {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        response = maintenanceResponse(req);
                        var regOptions = {
                            "name": parsedUrl.query.name,
                            "group": parsedUrl.query.group,
                            "port": parseInt(parsedUrl.query.port),
                            "ip": parsedUrl.query.ip,
                            "type": parsedUrl.query.type,
                            "version": parseInt(parsedUrl.query.version)
                        };
                        if (regOptions.type === "service") {
                            regOptions["extKeyRequired"] = (parsedUrl.query.extKeyRequired === "true" ? true : false);
                            regOptions["requestTimeout"] = parseInt(parsedUrl.query.requestTimeout);
                            regOptions["requestTimeoutRenewal"] = parseInt(parsedUrl.query.requestTimeoutRenewal);
                        }

                        core.registry.register(
                            regOptions,
                            function (err, data) {
                                if (!err) {
                                    response['result'] = true;
                                    response['data'] = data;
                                }
                                else {
                                    _self.log.warn("Failed to register service for [" + parsedUrl.query.name + "] " + err.message);
                                }
                                return res.end(JSON.stringify(response));
                            });
                    }
                }
                else {
                    var heartbeat = function (res) {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        response = maintenanceResponse(req);
                        response['result'] = true;
                        res.end(JSON.stringify(response));
                    };
                    if (req.url === '/heartbeat') {
                        return heartbeat(res);
                    }
                    return heartbeat(res);
                }
            });
            callback();
        });
    }
};

/**
 *
 */
controller.prototype.start = function (cb) {
    var _self = this;
    var maintenancePort = _self.registry.services.controller.port + _self.registry.serviceConfig.ports.maintenanceInc;
    _self.server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            _self.log.error('Address [port: ' + _self.registry.services.controller.port + '] in use by another service, exiting');
        }
        else {
            _self.log.error(err);
        }
    });
    _self.server.listen(_self.registry.services.controller.port, function (err) {
        if (err) {
            _self.log.error(err);
        }
        else {
            _self.log.info(_self.serviceName + " service started on port: " + _self.registry.services.controller.port);

            core.registry.registerHost({
                "serviceName": _self.serviceName,
                "serviceVersion": _self.serviceVersion,
                "serviceIp": _self.serviceIp,
                "serviceHATask": _self.serviceHATask
            }, _self.registry, function (registered) {
                if (registered)
                    _self.log.info("Host IP [" + _self.serviceIp + "] for service [" + _self.serviceName + "@" + _self.serviceVersion + "] successfully registered.");
                else
                    _self.log.warn("Unable to register host IP [" + _self.serviceIp + "] for service [" + _self.serviceName + "@" + _self.serviceVersion + "]");
            });

        }
        if (cb) {
            cb(err);
        }
    });
    _self.serverMaintenance.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            _self.log.error('Address [port: ' + (maintenancePort) + '] in use by another service, exiting');
        }
        else {
            _self.log.error(err);
        }
    });
    _self.serverMaintenance.listen(maintenancePort, function (err) {
        if (err) {
            _self.log.error(err);
        }
        else {
            _self.log.info(_self.serviceName + " service maintenance is listening on port: " + maintenancePort);
        }
    });
};


controller.prototype.stop = function (cb) {
    var _self = this;
    _self.log.info('stopping controllerServer on port:', _self.registry.services.controller.port);
    _self.server.close(function (err) {
        _self.serverMaintenance.close(function (err) {
            if (cb) {
                cb(err);
            }
        });
    });
};

module.exports = controller;