'use strict';

var registry = require('./registry/index');
registry.init();
exports.registry = registry;

var soajsLogger = require('./logger/index');
exports.getLogger = soajsLogger.getLogger;
exports.getLog = soajsLogger.getLog;

exports.meta = require('./meta/index');
exports.error = require('./error/index');
exports.key = require('./key/index');
exports.provision = require('./provision/index');
exports.security = require('./security/index');
exports.getMail = require('./mail/index');
exports.validator = require('./validator/index');
exports.getHostIp = function () {
    var ips = [];
    var ifnameLookupSequence = [];
    if (process.env.SOAJS_DEPLOY_HA) {
        var Docker = require('dockerode');
        var deployer = new Docker({socketPath: '/var/run/docker.sock'});
        var container = deployer.getContainer(process.env.HOSTNAME);
        container.inspect(function (error, containerInfo) {
            if (error) throw new Error(error);

            var taskName = containerInfo.Config.Labels['com.docker.swarm.task.name'];
            var swarmNetwork = containerInfo.NetworkSettings.Networks.ingress;

            return {
                "result": true,
                "ip": swarmNetwork.IPAddress,
                "extra": {"ips": ips, "n": ifnameLookupSequence, "swarmTask": taskName}
            };
        });

        return {"result": false, "ip": null, "extra": {"ips": ips, "n": ifnameLookupSequence}};
    }
    else {
        var os = require('os');
        var ifaces = os.networkInterfaces();
        ifnameLookupSequence = ["eth0", "en0", "eth1", "en1"];
        Object.keys(ifaces).forEach(function (ifname) {
            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }
                ips[ifname] = iface.address;
            });
        });
        for (var i = 0; i < ifnameLookupSequence.length; i++) {
            if (ips[ifnameLookupSequence[i]])
                return {
                    "result": true,
                    "ip": ips[ifnameLookupSequence[i]],
                    "extra": {"ips": ips, "n": ifnameLookupSequence}
                };
        }
        return {"result": false, "ip": null, "extra": {"ips": ips, "n": ifnameLookupSequence}};
    }
};