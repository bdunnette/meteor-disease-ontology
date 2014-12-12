Package.describe({
  name: 'bdunnette:disease-ontology',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function (api) {
  api.versionsFrom('1.0.1');
  api.addFiles('disease-ontology.js');
});

Package.onTest(function (api) {
  api.use('tinytest');
  api.use('disease-ontology');
  api.addFiles('disease-ontology-tests.js');
});