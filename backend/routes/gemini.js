/**
 * =======================================================
 *  @fileoverview  gemini.routes.js
 *  @project       ccmarket
 *  @description   Endpoint pour interroger l'API Gemini
 * =======================================================
 */

import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { verifierAuthentification } from '../middlewares/authMiddleware.js';
import { logError } from "../tools/logger.js";

const router = Router();
const ai = new GoogleGenAI({});

router.use(verifierAuthentification);

router.post("/", async (req, res) => {
     const { prompt } = req.body;

     if (!prompt || prompt.trim() === "") {
          return res.status(400).json({ message: "Le champ 'prompt' est requis." });
     }

     try {
          const response = await ai.models.generateContent({
               model: "gemini-2.5-flash",
               contents: prompt,
          });

          res.json({ reponse: response.text });
     } catch (error) {
          logError(error, "FONCTION: POST /api/gemini, MODULE: gemini.js");
          res.status(500).json({ message: "Erreur lors de la génération de la réponse." });
     }
});

export default router;
