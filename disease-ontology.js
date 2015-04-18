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
    }
  });

}
