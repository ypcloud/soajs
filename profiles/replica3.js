'use strict';

module.exports = {
    "name": "core_provision",
    "prefix": "",
    "servers": [
        {
            "host": "dataProxy-01",
            "port": 27017
        },
        {
            "host": "dataProxy-02",
            "port": 27017
        },
        {
            "host": "dataProxy-03",
            "port": 27017
        }
    ],
    "credentials": null,
    "streaming": {
        "batchSize" : 10000,
        "colName":{
            "batchSize" : 10000
        }
    },
    "URLParam": {
        "connectTimeoutMS": 0,
        "socketTimeoutMS": 0,
        "maxPoolSize": 5,
        "wtimeoutMS": 0,
        "slaveOk": true
    },
    "extraParam": {
        "db": {
            "native_parser": true,
            "w": "majority",
            "bufferMaxEntries": 0
        },
        "replSet": {
            "ha": true,
            "readPreference": "secondaryPreferred",
            "rs_name": "rs-soa"
        }
    }
};
