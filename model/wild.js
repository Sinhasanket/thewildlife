var mongoose = require("mongoose");

var wildSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Wild", wildSchema);