Diseases = new Meteor.Collection('diseases');

var parseStanza = function(stanza, getStanzaType) {
  var stanzaObject = {};
  stanzaLines = stanza.split("\n");
  if (getStanzaType === true) {
    stanzaObject.type = stanzaLines.shift();
  }
  stanzaLines.forEach(function(line) {
    var splitString = line.split(":");
    var key = splitString.shift();
    var value = splitString.join(":").replace(/^\s+/, '');
    if (value.match(/ \! /)) {
      value = value.split(" ! ")[0];
    }
    if (stanzaObject.hasOwnProperty(key) && typeof stanzaObject[key] === 'object') {
      stanzaObject[key].push(value);
    }
    else if (stanzaObject.hasOwnProperty(key)) {
      var keyVal = stanzaObject[key];
      stanzaObject[key] = [];
      stanzaObject[key].push(keyVal);
      stanzaObject[key].push(value);
    }
    else {
      stanzaObject[key] = value;
    }
  });
  return stanzaObject;
};

if (Meteor.isServer) {
  Meteor.methods({
    getDiseaseFromApi: function(doid) {
      HTTP.get('http://www.disease-ontology.org/api/metadata/' + encodeURIComponent(doid), function(err, response){
        var term = response.data;
        if (term.children) {
          term.children.forEach(function(term) {
            Diseases.upsert({
              'id': term[1]
            }, {
              'name': term[0],
              'id': term[1]
            });
          });
        }
        if (term.parents) {
          term.parents.forEach(function(term) {
            Diseases.upsert({
              'id': term[2]
            }, {
              'name': term[1],
              'id': term[2]
            });
          });
        }
        Diseases.upsert({
          'id': term.id
        }, term, function (error, result) {return result;});
      });
    },

    getOBOFile: function(oboUrl) {
      HTTP.get(oboUrl, function(err, response) {
        if (response.content) {
          Diseases.upsert({
            'oboUrl': oboUrl
          }, {
            $set: {
              'oboContent': response.content,
              'oboUrl': oboUrl
            }
          }, function(error, result) {return result;});
        }
      });
    },

    parseOBOStanzas: function(oboUrl) {
      console.log('Parsing OBO file from ' + oboUrl)
      var oboFile = Diseases.findOne({
        oboUrl: oboUrl
      });
      if (!oboFile) {
        console.log(oboFile);
        return oboFile;
      }
      var oboContent = oboFile.oboContent;
      var stanzas = oboContent.split("\n\n");
      var ontology = parseStanza(stanzas[0]);

      Diseases.update({
        'oboUrl': oboUrl
      }, {
        $set: {
          'stanzas': stanzas.slice(1)
        }
      }, function(error, result) {return result;});
    },

    parseOBOHeader: function(oboUrl) {
      console.log('Parsing OBO file header from ' + oboUrl)
      var oboFile = Diseases.findOne({
        oboUrl: oboUrl
      });
      var stanzas = oboFile.stanzas;
      var ontology = parseStanza(stanzas[0]);

      Diseases.update({
        'oboUrl': oboUrl
      }, {
        $set: {
          'ontology': ontology
        }
      }, function(err, result) {return result;});
    },

    parseOBOTerms: function(oboUrl) {
      console.log('Parsing OBO file terms from ' + oboUrl)
      var oboFile = Diseases.findOne({
        oboUrl: oboUrl
      });
      var terms = oboFile.stanzas;

      terms.forEach(function(stanza) {
        var term = parseStanza(stanza, true);
        delete term.type;
        Diseases.upsert({
          'id': term.id
        }, {
          $set: term
        });
      });
    }
  });

}
