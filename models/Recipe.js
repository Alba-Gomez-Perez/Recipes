const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
    id: Number,
    name: String,
    category: String,
    difficulty: String,
    prepTime: Number,
    cookTime: Number,
    servings: Number,
    calories: Number,
    photo_url: String,
    description: String,
    ingredients: [String],
    instructions: String
});

recipeSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        if (!ret.id) {
            ret.id = ret._id.toString();
        }
        delete ret._id;
    }
});

module.exports = mongoose.model("Recipe", recipeSchema);