Diseases = new Meteor.Collection('diseases');

if (Meteor.isServer) {
  Meteor.methods({
    getDisease: function(doid) {
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
    updateDiseases: function() {
      var diseasesToUpdate = Diseases.find({xrefs: {$exists: false}});
      diseasesToUpdate.forEach(function(disease) {
        var diseaseUpdated = Meteor.call('getDisease', disease.id);
      });
      return true;
    }
  });

  Meteor.startup(function () {
    var diseaseCount = Diseases.find().count();
    console.log(diseaseCount + ' diseases in database');
    if (diseaseCount === 0) {
      var importDiseases = Meteor.call('getDisease', 'DOID:4');
    }
    Meteor.call('updateDiseases', function(error, result) {console.log(result)});
  });
}
