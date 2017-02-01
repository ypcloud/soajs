var regExample = {
    timeLoaded: 1485359061958,
    name: 'dashboard',
    environment: 'dashboard',
    profileOnly: false,
    coreDB: {
        provision: {
            name: 'core_provision',
            prefix: '',
            servers: [Object],
            credentials: null,
            streaming: [Object],
            URLParam: [Object],
            extraParam: [Object],
            registryLocation: [Object],
            timeConnected: 1485359061988
        },
        es: {
            prefix: '',
            servers: [Object],
            credentials: null,
            streaming: undefined,
            URLParam: [Object],
            extraParam: [Object],
            registryLocation: [Object],
            name: 'es'
        },
        session: {
            name: 'core_session',
            prefix: '',
            servers: [Object],
            credentials: null,
            URLParam: [Object],
            extraParam: [Object],
            store: {},
            collection: 'sessions',
            stringify: false,
            expireAfter: 1209600000,
            registryLocation: [Object]
        }
    },
    tenantMetaDB: {
        urac: {
            prefix: '',
            servers: [Object],
            credentials: null,
            streaming: undefined,
            URLParam: [Object],
            extraParam: [Object],
            name: '#TENANT_NAME#_urac'
        },
        news: {
            prefix: '',
            servers: [Object],
            credentials: null,
            streaming: undefined,
            URLParam: [Object],
            extraParam: [Object],
            name: '#TENANT_NAME#_news'
        }
    },
    serviceConfig: {
        awareness: {
            healthCheckInterval: 500,
            autoRelaodRegistry: 300000,
            maxLogCount: 5,
            autoRegisterService: true
        },
        key: {algorithm: 'aes256', password: 'soajs key lal massa'},
        logger: {src: true, level: 'debug', formatter: [Object]},
        cors: {
            enabled: true,
            origin: '*',
            credentials: 'true',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            headers: 'key,soajsauth,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type',
            maxage: 1728000
        },
        oauth: {grants: [Object], debug: false},
        ports: {maintenanceInc: 1000},
        cookie: {secret: 'this is a secret sentence'},
        session: {
            name: 'soajsID',
            secret: 'this is antoine hage app server',
            cookie: [Object],
            resave: false,
            saveUninitialized: false
        }
    },
    custom: {},
    "services": {
        "controller": {
            "group": "controller",
            "maxPoolSize": 100,
            "authorization": true,
            "port": 4000,
            "requestTimeout": 30,
            "requestTimeoutRenewal": null,
            "hosts": {
                "1": ["192.168.2.33"],
                "latest": 1
            },
            "newServiceOrHost": true
        },
        "urac": {
            "group": "service",
            "port": 4001,
            "versions": {
                "1": {
                    "apis": [],
                    "extKeyRequired": true
                }
            },
            "requestTimeoutRenewal": null,
            "requestTimeout": null,
            "version": 1,
            "extKeyRequired": true,
            "awareness": false,
            "hosts": {
                "1": ["127.0.0.1", "192.168.2.33"],
                "latest": 1
            }
        },
        "oauth": {
            "group": "service",
            "port": 4002,
            "versions": {
                "1": {
                    "apis": [],
                    "extKeyRequired": true
                }
            },
            "requestTimeoutRenewal": null,
            "requestTimeout": null,
            "version": 1,
            "extKeyRequired": true,
            "awareness": false,
            "hosts": {
                "1": ["127.0.0.1", "192.168.2.33"],
                "latest": 1
            }
        }
    },
    "daemons": {
        "helloDaemon": {
            "group": "daemon",
            "port": 4200,
            "versions": {
                "1": {
                    "jobs": []
                }
            },
            "hosts": {
                "1": ["127.0.0.1"],
                "latest": 1
            }
        },
        "helloDaemonCron": {
            "group": "daemon",
            "port": 4201,
            "versions": {
                "1": {
                    "jobs": []
                }
            },
            "hosts": {
                "1": ["127.0.0.1"],
                "latest": 1
            }
        }
    }
};
