Diseases = new Meteor.Collection('diseases');

if (Meteor.isServer) {
  Meteor.methods({
    updateAllDiseases: function () {
      var result = HTTP.get(Meteor.settings.bioportal.startUrl, {
        params: {
          apikey: Meteor.settings.bioportal.apiKey
        }
      });

      for (var d in result.data.collection) {
        var disease = result.data.collection[d];
        console.log(disease);
        Diseases.upsert({
          '@id': disease['@id']
        }, disease);
      }

      for (i = result.data.nextPage; i <= result.data.pageCount; i++) {
        console.log(i);
        var result = HTTP.get(Meteor.settings.bioportal.startUrl, {
          params: {
            apikey: Meteor.settings.bioportal.apiKey,
            page: i
          }
        });
        console.log(result);
        for (var d in result.data.collection) {
          var disease = result.data.collection[d];
          console.log(disease);
          Diseases.upsert({
            '@id': disease['@id']
          }, disease);
        }
      }
    },

    getOBO: function(){
      HTTP.get('http://purl.obolibrary.org/obo/doid.obo', function(err, response){
        console.log(err);
        if (response.content){
          var stanzas = response.content.split("\n\n");
          var headerData = stanzas[0].split("\n");
          console.log(headerData);
          var ontologyInfo = {};
          for (var h in headerData) {
            rowSplit = headerData[h].split(":");
            // console.log(rowSplit);
            //anything before the first colon will be the line type
            var key = rowSplit[0];
            //discarding subsetdefs for now, since each disease won't need them
            if (key.toLowerCase() != 'subsetdef') {
              if (key == 'date') {
                var dateArray = rowSplit.slice(1);
                var year = dateArray[2].split(' ')[0];
                // subtract one to get a javascript-style month
                var month = dateArray[1] - 1;
                var day = dateArray[0];
                var hour = dateArray[2].split(' ')[1];
                var minute = dateArray[3];
                var value = new Date(year, month, day, hour, minute);
              } else {
                //re-join the remainder of the line, replacing removed colons
                var value = _.clean(rowSplit.slice(1).join(":"));
              }
              ontologyInfo[key] = value
            };
          }
          // console.log(ontologyInfo);
          for (var s in stanzas.slice(1)){
            var stanza = stanzas[s];
            var stanzaParts = stanza.split("\n");
            var stanzaType = stanzaParts[0].replace(/[\[\]]+/g,'').toLowerCase();
            if (stanzaType == 'term'){
              var term = {ontology: ontologyInfo};
              termData = stanzaParts.slice(1);
              for (var t in termData) {
                rowSplit = termData[t].split(":");
                //anything before the first colon will be the line type
                var key = rowSplit[0];
                //re-join the remainder of the line, replacing removed colons
                var value = _.clean(rowSplit.slice(1).join(":"));
                // console.log(key, value);
                if (key in term) {
                  if (Array.isArray(term[key])) {
                    term[key].push(value);
                  } else {
                    term[key] = [term[key], value];
                  }
                } else {
                  term[key] = value;
                }
              }
              // console.log(term);
              Diseases.upsert({
                'id': term['id']
              }, term);
            }
          }
        }
      });
    }
  });

  Meteor.startup(function () {
    console.log(Meteor.settings);
    //console.log('BioPortal API Key: ' + Meteor.settings.bioportal.apiKey);
    console.log(Diseases.find().count() + ' diseases in database');
  });
}
