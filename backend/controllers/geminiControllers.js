import { GoogleGenAI } from '@google/genai';

// La clé est lue automatiquement via process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

export async function genererDescriptionAnnonce(req, res) {
    try {
        const { titre, categorie } = req.body;

        // Appel du modèle Gemini 1.5 Flash
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Rédige une courte description vendeuse pour une annonce d'occasion. Titre: ${titre}, Catégorie: ${categorie}.`,
        });

        res.json({ description: response.text });

    } catch (error) {
        console.error("Erreur Gemini API:", error);
        res.status(500).json({ message: "Erreur lors de la génération" });
    }
}
