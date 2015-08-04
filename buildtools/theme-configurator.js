// =============================================================================
// Build LESS files
// Originally source from https://github.com/Nemo64/meteor-bootstrap

var fs   = Npm.require('fs');
var path = Npm.require('path');

// -----------------------------------------------------------------------------
// Helpers
//
var createLessFile = function (path, content) {
  fs.writeFileSync(path, content.join('\n'), { encoding: 'utf8' });
};

var getAsset = function (filename) {
  return ThemeData(filename);
};

var getLessContent = function (filename) {
  var content = getAsset(filename);
  return '\n\n// @import "' + filename + '"\n'
    + content.replace(/@import\s*["']([^"]+)["'];?/g, function (statement, importFile) {
    return getLessContent(path.join(path.dirname(filename), importFile));
  });
};



// -----------------------------------------------------------------------------
// Build Handler
//
var handler = function (compileStep, isLiterate) {
  var jsonPath = compileStep._fullInputPath;

  // read the configuration of the project
  var userConfiguration = compileStep.read().toString('utf8');

  // if empty (and only then) write distributed configuration
  if (userConfiguration === '') {
    userConfiguration = distributedConfiguration;
    fs.writeFileSync(jsonPath, userConfiguration);
  }

  // parse configuration
  try {
    userConfiguration = JSON.parse(userConfiguration);
  } catch (e) {
    compileStep.error({
      message: e.message,
      sourcePath: compileStep.inputPath
    });
    return;
  }

  // configuration
  var moduleConfiguration = userConfiguration.modules || {};

  // these variables contain the files that need to be included
  var js = {}; // set of required js files
  var less = {}; // set of required less files

  // read module configuration to find out which js/less files are needed
  var allModulesOk = _.every(moduleConfiguration, function (enabled, module) {

    var moduleDefinition = moduleDefinitions[module];
    if (moduleDefinition == null) {
      compileStep.error({
        message: "The module '" + module + "' does not exist.",
        sourcePath: compileStep.inputPath
      });
      return false; // break
    }

    if (! enabled) {
      return true; // continue
    }

    _.each(moduleDefinition.less || [], function (file) {
      less[file] = file;
    });
    _.each(moduleDefinition.js || [], function (file) {
      js[file] = file;
    });

    return true;
  });

  if (! allModulesOk) {
    return;
  }

  // add javascripts
  for (var jsPath in js) {
    var file = getAsset(jsPath);
    compileStep.addJavaScript({
      path: jsPath,
      data: file,
      sourcePath: jsPath,
      bare: true // they are already wrapped (tiny optimisation)
    });
  }


  // **************************************************************************
  // Filenames for the various less files that are added into 
  // reaction/client/themes/bootstrap
  // 

  // Our imports
  // -- these end up in the user editable less file
  var bootstrapLessFile = jsonPath.replace(/json$/i, 'bootstrap.less');
  var mixinsLessFile = jsonPath.replace(/json$/i, 'mixins.import.less')
  var variablesLessFile = jsonPath.replace(/json$/i, 'variables.import.less')

  // User editable files
  var userImportsLessFile = jsonPath.replace(/json$/i, 'import.less');
  var userOverridesLessFile = jsonPath.replace(/json$/i, 'overrides.import.less');

  // Final output
  var outputLessFile = jsonPath.replace(/json$/i, 'less');



  // **************************************************************************
  // Mixins
  //
  createLessFile(mixinsLessFile, [
    "// ************************************************",
    "// THIS FILE IS GENERATED, DO NOT MODIFY IT!",
    "// ************************************************",
    "//",
    "// These are the mixins Reaction provides",
    "// They are included here so you can use them in your less files too,",
    "// However: you should @import \"" + path.basename(userImportsLessFile) + "\" instead of this",
    getLessContent('default/mixins.less')
  ]);


  // **************************************************************************
  // Variables
  //
  createLessFile(variablesLessFile, [
    "// ************************************************",
    "// THIS FILE IS GENERATED, DO NOT MODIFY IT!",
    "// ************************************************",
    "//",
    "// These are the mixins Reaction provides",
    "// They are included here so you can use them in your less files too,",
    "// However: you should @import \"" + path.basename(variablesLessFile) + "\" instead of this",
    getLessContent('default/variables.less')
  ]);



  // **************************************************************************
  // User editable import file (loaded first)
  // -- Best used for modyfing variables and mixins
  //
  if (! fs.existsSync(userImportsLessFile)) {
    createLessFile(userImportsLessFile, [
      "// ************************************************",
      "// THIS FILE IS FOR YOU TO MODIFY REACTION THEMING!",
      "// ************************************************",
      "//",
      "// It won't be overwritten as long as it exists.",
      "// You may include this file into your less files to benefit from",
      "// mixins and variables that Reaction provides.",
      "// If you are not using nemo64:bootstrap, you'll need to change",
      "// the bootstrap import to your bootstrap.less path",
      '',
      '@import "' + path.basename("custom.bootstrap.less") + '";',
      '@import "' + path.basename(mixinsLessFile) + '";',
      '@import "' + path.basename(variablesLessFile) + '";',
      '',
      ''
    ]);
  }


  // **************************************************************************
  // User editable overrides file (loaded last)
  // -- Best used for overriding CSS
  //
  if (! fs.existsSync(userOverridesLessFile)) {
    createLessFile(userOverridesLessFile, [
      "// ************************************************",
      "// THIS FILE IS FOR YOU TO MODIFY REACTION THEMING!",
      "// ************************************************",
      "//",
      "// It won't be overwritten as long as it exists.",
      '//',
      '// This file is the last import after all base reaction',
      '// variables, styles, and mixins.',
      '//',
      '// If you want to override variables or add custom styles to the top,',
      "// see '" + path.basename(userImportsLessFile) + "'",
      '',
      ''
    ]);
  }


  // **************************************************************************
  // Create a file that brings everything together
  //
  var bootstrapContent = [
    "// ************************************************",
    "// THIS FILE IS GENERATED, DO NOT MODIFY IT!",
    "// ************************************************",
    "//",
    "// It includes the bootstrap modules configured in " + compileStep.inputPath + ".",
    "// You may need to use 'meteor add nemo64:bootstrap' if the styles are not loaded.",
    '',
    "// If it throws errors your bootstrap.import.less is probably invalid.",
    "// To fix that remove that file and then recover your changes.",
    '',
    '@import "' + path.basename(userImportsLessFile) + '";'
  ];
  
  // add all of our LESS files into this one file
  _.each(less, function (lessPath) {
    bootstrapContent.push(getLessContent('' + lessPath));
  });

  // Add the final import for user overrides
  var bootstrapContentEnd = [
    "// ************************************************",
    "// ADD ANY CUSTOM CSS INTO THE FOLLOWING FILE",
    "// ************************************************",
    "//",
    "// If you need to add your own custom styling, please add it to",
    "// the following file '" + path.basename(userOverridesLessFile) + "'",
    '//',
    "// Alternatively, you may the file '" + path.basename(userImportsLessFile) + "'",
    '// to override any variables or mixins globally.',
    '',
    '',
    '@import "' + path.basename(userOverridesLessFile) + '";'
  ];

  // -- Finally, create the file.
  createLessFile(outputLessFile, bootstrapContent.concat(bootstrapContentEnd));
};

Plugin.registerSourceHandler('reaction.json', {archMatching: 'web'}, handler);
