const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  aboutUs:[
    {
        title: String,
        description: String
    }
  ],
  termsAndCondition:[
    {
      title: String,
      description: String
  }
  ],
  helpAndSupport:[
    {
      question: String,
      answer: String
  }
  ],
  privacyPolicies :[
    {
      title: String,
      description: String
  }
  ],
});

module.exports = mongoose.model('AboutUs', aboutUsSchema);
