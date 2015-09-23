Package.describe({
  summary: "Reaction Commerce Bootstrap theme builder",
  name: "reactioncommerce:bootstrap-theme",
  version: "1.5.0",
  git: "https://github.com/reactioncommerce/reaction-bootstrap-theme.git"
});

Package.registerBuildPlugin({
  name: 'theme-configurator',
  use: [
    'underscore@1.0.4',
    'reactioncommerce:core-theme@1.7.0'
  ],
  sources: [
    'buildtools/module-definitions.js',
    'buildtools/distributed-configuration.js',
    'buildtools/theme-configurator.js'
  ],
  npmDependencies: {}
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.2');
  // meteor base packages
  api.use("standard-minifiers");
  api.use("meteor-base");

  // meteor add-on packages

  api.use("less");

  api.use("reactioncommerce:core-theme");
  api.use("fortawesome:fontawesome@4.4.0");
});
