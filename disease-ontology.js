Diseases = new Meteor.Collection('diseases');

var parseStanza = function(stanza, getStanzaType){
	var stanzaObject = {};
	stanzaLines = stanza.split("\n");
	if (getStanzaType === true) {
	  stanzaObject.type = stanzaLines.shift();
	}
	stanzaLines.forEach(function(line){
    var splitString=line.split(":");
    var key=splitString.shift();
    var value=splitString.join(":").replace(/^\s+/,'');
    if (stanzaObject.hasOwnProperty(key) && typeof stanzaObject[key] === 'object') {
      stanzaObject[key].push(value);
    } else if (stanzaObject.hasOwnProperty(key)) {
      var keyVal = stanzaObject[key];
      stanzaObject[key] = [];
      stanzaObject[key].push(keyVal);
      stanzaObject[key].push(value);
    } else {
      stanzaObject[key] = value;
    }
  });
	return stanzaObject;
}


if (Meteor.isServer) {
  Meteor.methods({
    getOBO: function(oboUrl){
      HTTP.get(oboUrl, function(err, response){
        console.log(err);
        Diseases.upsert({
              'oboUrl': oboUrl
            }, {$set:{
              'oboContent': response.content,
              'oboUrl': oboUrl
            }});
      });
    },
    
    parseStanzas: function(oboUrl){
      var oboFile = Diseases.findOne({oboUrl: oboUrl});
      var oboContent = oboFile.oboContent;
      var stanzas = oboContent.split("\n\n");
      var ontology = parseStanza(stanzas[0]);
      
      Diseases.update({
              'oboUrl': oboUrl
            }, {$set:{
              'stanzas': stanzas.slice(1)
            }});
    },
    
    parseHeader: function(oboUrl){
      var oboFile = Diseases.findOne({oboUrl: oboUrl});
      var stanzas = oboFile.stanzas;
      var ontology = parseStanza(stanzas[0]);
      
      Diseases.update({
              'oboUrl': oboUrl
            }, {$set:{
              'ontology': ontology
            }});
    },
    
    parseTerms: function(oboUrl){
      var oboFile = Diseases.findOne({oboUrl: oboUrl});
      var stanzas = oboFile.stanzas;
      var terms = stanzas.slice(0,10);
      
      terms.forEach(function(stanza){
        console.log(parseStanza(stanza, true));
      });
    }
      
  });

}



