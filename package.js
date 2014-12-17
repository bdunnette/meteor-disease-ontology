Package.describe({
  name: 'bdunnette:disease-ontology',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function (api) {
  api.versionsFrom('1.0.1');
  api.use('http');
  api.addFiles('disease-ontology.js');
  api.export('Diseases');
});

Package.onTest(function (api) {
  api.use('tinytest');
  api.use('disease-ontology');
  api.addFiles('disease-ontology-tests.js');
});