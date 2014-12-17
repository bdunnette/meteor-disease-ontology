Package.describe({
  name: 'bdunnette:disease-ontology',
  summary: 'Add Disease Ontology classes to a Meteor application',
  version: '1.0.0',
  git: 'https://github.com/bdunnette/meteor-disease-ontology'
});

Package.onUse(function (api) {
  api.versionsFrom('1.0.1');
  api.use('http');
  api.use('wizonesolutions:underscore-string@1.0.0');
  api.addFiles('disease-ontology.js');
  api.export('Diseases');
});

Package.onTest(function (api) {
  api.use('tinytest');
  api.use('disease-ontology');
  api.addFiles('disease-ontology-tests.js');
});
