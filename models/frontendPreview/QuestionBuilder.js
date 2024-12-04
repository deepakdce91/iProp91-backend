const mongoose = require("mongoose");
const collection = "questionBuilder";

const currentSchema = new mongoose.Schema({
  data: [
    {
      type: mongoose.Schema.Types.Mixed, // Allows mixed or dynamic types
      required: true,
    },
  ],
}, { timestamps: true });
const model = mongoose.model(collection, currentSchema);

module.exports = model;
