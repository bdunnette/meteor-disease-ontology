Diseases = new Meteor.Collection('diseases');

if (Meteor.isServer) {
  Meteor.startup(function () {
    console.log('BioPortal API Key: ' + Meteor.settings.bioportalApiKey);
    console.log(Diseases.find().count() + ' diseases in database');
    var diseases = HTTP.get('http://data.bioontology.org/ontologies/DOID/classes', {
      params: {
        apikey: Meteor.settings.bioportalApiKey
      }
    });
    console.log(diseases);
    for (var d in diseases.data.collection) {
      var disease = diseases.data.collection[d];
      console.log(disease);
      Diseases.insert(disease);
    };
  });
}