'use strict'
//var superagent=require('superagent');
var level = require('level-browserify');
var levelgraph=require('levelgraph');
//var levelgraphN3=require('levelgraph-n3');
var n3=require('n3');
var n3u=n3.Util;
var wdk = require('wikidata-sdk')

class LabelTool {
  constructor (options) {
    this.prefixes={
      lt:"http://labelthis.library.ucdavis.edu/labels#",
      tool:"http://labelthis.library.ucdavis.edu/label-tool#",
      lt0:"http://labelthis.library.ucdavis.edu/ontology#",
      rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      w:"http://library.ucdavis.edu/wine-ontology#",
      a:"http://library.ucdavis.edu/wine/Amerine#",
      o:"http://library.ucdavis.edu/wine/OpusOne#"
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
//      this.db=levelgraphN3(levelgraph(level(file)));
      this.db=levelgraph(level(file));
    }
    return this;
  }

  // Get a List of wines
  wines(format,callback) {
    var wines;
    var db=this.db;
    var writer=n3.Writer({ prefixes: this.prefixes });
    var vintage={};

    var search_f= {
      ids:[
        {subject:db.v("wine"),
         predicate:this.prefix('type','rdf'),
         object:this.prefix('Wine','w')
        }],
      overview:[
        {subject:db.v("wine"),
         predicate:this.prefix('type','rdf'),
         object:this.prefix('Wine','w')
        },
        {subject:db.v("wine"),
         predicate:this.prefix('brandName','w'),
         object:db.v("brandName")
        },
        {subject:db.v("wine"),
         predicate:this.prefix('color','w'),
         object:db.v("color")
        },
        {subject:db.v("wine"),
         predicate:this.prefix('type','w'),
         object:db.v("type")
        },
        {subject:db.v("wine"),
         predicate:this.prefix('otherDesignation','w'),
         object:db.v("otherDesignation")
        },
        {subject:db.v("wine"),
         predicate:this.prefix('vintage','w'),
         object:db.v("vintage")
        },
      ],
      vintage: [
        {subject:db.v("vintage"),
         predicate:this.prefix('year','w'),
         object:db.v("year")
        },
        {subject:db.v("vintage"),
         predicate:this.prefix('image','w'),
         object:db.v("image")
        },
      ],
      join:[
        {subject:db.v("wine"),
         predicate:this.prefix('type','rdf'),
         object:this.prefix('Wine','w')
        },
        {subject:db.v("wine"),
         predicate:this.prefix('brandName','w'),
         object:db.v("brandName")
        },
        {subject:db.v("wine"),
         predicate:this.prefix('color','w'),
         object:db.v("color")
        },
        {subject:db.v("wine"),
         predicate:this.prefix('type','w'),
         object:db.v("type")
        },
        {subject:db.v("wine"),
         predicate:this.prefix('otherDesignation','w'),
         object:db.v("otherDesignation")
        },
        {subject:db.v("wine"),
         predicate:this.prefix('vintage','w'),
         object:db.v("vintage")
        },
        {subject:db.v("vintage"),
         predicate:this.prefix('year','w'),
         object:db.v("year")
        },
        {subject:db.v("vintage"),
         predicate:this.prefix('image','w'),
         object:db.v("image")
        },
      ]
    };

    function fixup(err,list) {
      var v;
      if (! err) {
        list.forEach(function(l) {
          if (vintage[l.vintage]) {
            v=vintage[l.vintage];
            l.year=v.year;
            l.image=v.image;
          }
          ['brandName','otherDesignation','year'].forEach(function(b) {
            if (l[b] ) { l[b]=n3u.getLiteralValue(l[b]); }
          });
          ['wine', 'color','type'].forEach(function(b) {
            if(l[b]) { l[b]=writer._encodeIriOrBlankNode(l[b]); }
          });
          if (l.image) {
            l.browseImage=l.image.replace('2048x','200x');
          }
        });
      }
      callback(err,list);
    }

    function getVintage(err,list) {
      if (! err) {
        list.forEach(function(l) {
          vintage[l['vintage']]=l;
        });
      }
      db.search(search_f[format],fixup);
    }

    // Get the vintages
    db.search(search_f.vintage,getVintage);
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
