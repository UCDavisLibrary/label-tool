'use strict'
//var superagent=require('superagent');

class ScribeApi {
  constructor (options) {
    this._scribe=options.scribe;
    this._vision_key=options.vision_key;
    // From https://googlecloudplatform.github.io/google-cloud-node/#/docs/vision/0.3.0/guides/authentication
    //
    var config={
      projectId:'api-project-883511445304',
      credentials: require('../service-auth.json')
    };
    debugger;
    this._vision=require('@google-cloud/vision')(config);
  }
  scribe() {
    return this._scribe
  }

  detectLabels (inputFile, callback) {
    var vision = this._vision;
    debugger;
    // Make a call to the Vision API to detect the labels
    vision.detectLabels(inputFile, { verbose: true }, function (err, labels) {
      if (err) {
        return callback(err);
      }
     console.log('result:', JSON.stringify(labels, null, 2));
      callback(null, labels);
    });
  }
}

module.exports = ScribeApi;
