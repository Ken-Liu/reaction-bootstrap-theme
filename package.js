Package.describe({
  summary: "Reaction Commerce Bootstrap theme builder",
  name: "reactioncommerce:bootstrap-theme",
  version: "1.0.0",
  git: "https://github.com/reactioncommerce/reaction-bootstrap-theme.git"
});

Package.registerBuildPlugin({
  name: 'theme-configurator',
  use: [
    'underscore',
    'reactioncommerce:core-theme@1.4.1'
  ],
  sources: [
    'buildtools/module-definitions.js',
    'buildtools/distributed-configuration.js',
    'buildtools/theme-configurator.js'
  ],
  npmDependencies: {}
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');
  //core meteor packages
  api.use("meteor-platform");
  api.use("reactioncommerce:core-theme");
});