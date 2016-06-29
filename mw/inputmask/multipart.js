'use strict';

var multiparty = require('multiparty');
var mime = require('mime-types');
var fs = fs = require('fs');

/**
 * Function to test if the request is multpart
 * @param req
 * @returns {*|boolean} true if the request is of content-type "multipart/form-data"
 */
exports.isMultipart = function checkIfMultipart(req) {
    return false;
    return req.headers['content-type'] && req.headers['content-type'].indexOf("multipart/form-data") > -1;
};


/**
 * Parses the multipart request
 * @param req to parse
 * @param config block
 * @param cb {function} to call after the parsing
 */
exports.parse = function parseMultipart(req, config, cb) {
    console.log("config: " + JSON.stringify(config));
    let form = new multiparty.Form();
    let multiParts = {};
    form.parse(req, function (err, fields, files) {

        if (err)
            return cb(err);

        Object.keys(fields).forEach(function (fieldName) {
            let value = fields[fieldName];
            if (value.length === 1) {
                multiParts[fieldName] = fields[fieldName][0];
            }
            else
                multiParts[fieldName] = fields[fieldName];
        });

        Object.keys(files).forEach(function (fieldName) {
            let value = files[fieldName];
            if (value.length == 1)
                multiParts[fieldName] = fileDataBuilder(value[0], fieldName);
            else {
                multiParts[fieldName] = [];
                for (let i = 0; i < value.length; i++) {
                    multiParts[fieldName].push(fileDataBuilder(value[i], fieldName));
                }
            }
        });
        console.log("Multiparts = " + JSON.stringify(multiParts));
        return cb(null, multiParts);
    });//11/28836202110111/adProofProd/1-5616641462/TD_AD_PROOF_PROD_D_20160621105104076_1000193016.pdf?
};

/**
 * Construct the file info data structure
 * @param partData
 * @param fieldName
 * @returns {{originalFileName: {string}, name: *, file: *, size: number, mimeType: {}, mv: (function(this:fileDataBuilder)), rm: (function(this:fileDataBuilder))}}
 */
function fileDataBuilder(partData, fieldName){
    return {
        originalFileName: partData.originalFilename,
        name: fieldName,
        file: partData.path,
        size: 0,
        mimeType: mime.lookup(this.file),

        mv: function moveMultiPartTmpFile(destination, cb){
            fs.rename(this.file, destination, function mpMvCb(error){
                if(!error)
                this.file = destination;
                cb(error)
            }.bind(this));
        }.bind(this),

        rm: function removeMultipartTmpFile(cb){
            fs.unlink(this.file, function mpRmCb(error){
                if(!error)
                    this.file = null;
                cb(error);
            }.bind(this));
        }.bind(this)
    };
}
