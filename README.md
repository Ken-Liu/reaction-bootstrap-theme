Reaction Commerce Bootstrap Theme

`meteor add reactioncommerce:bootstrap-theme`

This Meteor package creates the Reaction Commerce Bootstrap theme in `client/themes/bootstrap` (or other directory)

This depends on and builds from `reactioncommerce:core-theme`.

This package also requires `nemo64:bootstrap` to be installed in the Meteor application.

Add `custom.reaction.json` file in the directory ( `client/themes/bootstrap`)to create the theme.

File contents are:

```
{"modules": {
  "accounts":        true,
  "cart":            true,
  "dashboard":       true,
  "layout":          true,
  "products":        true,
  "core":            true
}}
```
