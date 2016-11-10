'use strict'
//var superagent=require('superagent');
var level = require('level-browserify');
var levelgraph=require('levelgraph');
var n3=require('n3');
var n3u=n3.Util;
var wdk = require('wikidata-sdk')

class LabelTool {
  constructor (options) {
    this.prefixes={
      lt:"http://labelthis.library.ucdavis.edu/labels#",
      tool:"http://labelthis.library.ucdavis.edu/label-tool#",
      lt0:"http://labelthis.library.ucdavis.edu/ontology#"
      };
    if (options && options.scribe) {
      this._scribe=options.scribe;
    }
  }
  // Add Standard prefixes assertion components;
  prefix(id,p) {
    var p = (typeof p !== 'undefined') ?  p : 'lt';
    return n3u.expandPrefixedName([p,id].join(':'),this.prefixes);
  }
  put(s,p,o,g) {
    var g = (typeof g !== 'undefined') ?  g : ['foo','tool'];
    this.db.put(
      {subject:
       (Array.isArray(s))?this.prefix(s[0],(s[1])?s[1]:'lt'):s,
       predicate:
       (Array.isArray(p))?this.prefix(p[0],(p[1])?p[1]:'lt'):p,
       object:
       (Array.isArray(o))?this.prefix(o[0],(o[1])?o[1]:'lt'):o,
       graph:
       (Array.isArray(g))?this.prefix(g[0],(g[1])?g[1]:'tool'):g
      });
  }

  // Set the Database
  db(file) {
    if(file) {
      this.db=levelgraph(level(file));
    }
    return this;
  }

  scribe() {
    return this._scribe
  }

  // Google Vision Pass Thru
  authorize(auth) {
    this._vision=require('@google-cloud/vision')(auth);
  }
  // Detect is simply a wrapper
  detect (urls, opts, callback) {
    var vision=this._vision;
    vision.detect(urls,opts,callback);
  }

  // This tool adds a number of labels to the system for data comparisons.
  initialize() {
    // First get the labels of all wines.
    var wineQID = 'Q282';
    var sparql = `
SELECT ?instance ?instanceLabel WHERE {
    ?instance wdt:P31* wd:${wineQID} .
    SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en" .
    }
}
`
    var url = wdk.sparqlQuery(sparql)

    promiseRequest(url)
      .then(wdk.simplifySparqlResults)
      .then((simplifiedResults) => {
        return url;
      });
  }
}
module.exports = LabelTool;
