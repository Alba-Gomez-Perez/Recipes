import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

const uri = process.env.MONGO_URI;

if (!mongoose.connections[0].readyState) {
    await mongoose.connect(uri);
}

export default async function handler(req, res) {
    try {

        // GET /api/recipes
        if (req.method === "GET") {
            const { _page = 1, _limit = 12 } = req.query;

            const page = parseInt(_page);
            const limit = parseInt(_limit);
            const skip = (page - 1) * limit;

            const recipes = await Recipe.find()
                .skip(skip)
                .limit(limit);

            return res.status(200).json(recipes);
        }

        // POST /api/recipes
        if (req.method === "POST") {
            const newRecipe = new Recipe(req.body);
            const savedRecipe = await newRecipe.save();
            return res.status(201).json(savedRecipe);
        }

        return res.status(405).json({ error: "Method not allowed" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}