import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Recipe from "./models/Recipe.js";

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://albagope_db_user:alba22gomez@albacluster.uwqlte5.mongodb.net/?appName=AlbaCluster";

mongoose.connect(uri)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ Error:", err));

/* ----- ENDPOINTS ----- */

app.get("/api/recipes", async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/recipes/:id", async (req, res) => {
    try {
        const idParam = req.params.id;
        const query = isNaN(Number(idParam)) ? { _id: idParam } : { id: Number(idParam) };
        
        let recipe = await Recipe.findOne(query);
        if (!recipe && mongoose.Types.ObjectId.isValid(idParam)) {
            recipe = await Recipe.findById(idParam);
        }

        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).json({ error: "Recipe not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/recipes", async (req, res) => {
    try {
        const newRecipe = new Recipe(req.body);
        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/recipes/bulk", async (req, res) => {
    try {
        await Recipe.insertMany(req.body.recipes);
        res.json({ message: "Recipes inserted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("🚀 Server running, listening on port 3000");
});