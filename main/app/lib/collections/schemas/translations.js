
/*
* translations schema
* placeholder
*/

Core.Schemas.Translation = new SimpleSchema({
  language: {
    type: String
  },
  i18n: {
    type: String,
    index: 1
  },
  translation: {
    type: Object,
    blackbox: true
  }
});
