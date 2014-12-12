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
  });

  Meteor.startup(function () {
    console.log(Meteor.settings);
    console.log('BioPortal API Key: ' + Meteor.settings.bioportal.apiKey);
    console.log(Diseases.find().count() + ' diseases in database');
  });
}