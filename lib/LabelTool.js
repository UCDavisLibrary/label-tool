'use strict'
//var superagent=require('superagent');

class LabelTool {
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

  detect (urls, opts, callback) {
    var vision = this._vision;
    debugger;
    vision.detect(urls,opts,callback);
  }
}

module.exports = LabelTool;
