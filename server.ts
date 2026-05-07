import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json());

  // AI Enhancement Endpoint
  app.post("/api/ai-enhance", async (req, res) => {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.error("AI Enhancement Error: Missing or invalid GEMINI_API_KEY environment variable.");
      return res.status(500).json({ error: "AI service is not configured. Please set GEMINI_API_KEY in the Secrets panel." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an AI assistant for the anime social platform YOKAI. 
        Your task is to ENHANCE the grammar and clarity of the following anime review.
        
        STRICT RULES:
        1. ONLY fix grammar, spelling, and punctuation.
        2. NEVER change the meaning or opinion of the user.
        3. NEVER add your own opinions or hallucinations.
        4. Keep the tone authentic to the original user.
        5. If the content is already perfect, return it as is.
        
        Review to enhance:
        "${content}"`,
      });

      const enhancedText = response.text;
      res.json({ enhancedText });
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      res.status(500).json({ error: "Failed to enhance content" });
    }
  });

  // Character Chat Endpoint
  app.post("/api/character-chat", async (req, res) => {
    const { character, message, mode, history } = req.body;
    if (!character || !message) {
      return res.status(400).json({ error: "Character and message are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(500).json({ error: "AI service is not configured." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const modeInstructions = {
        Normal: "Maintain a balanced and consistent personality based on your description.",
        Roast: "Be savage, funny, and use clever insults. Don't be afraid to be mean in a humorous anime-style way.",
        Friendly: "Be extremely supportive, chill, and kind. Act like a best friend.",
        Emotional: "Be deep, dramatic, and sensitive. Use poetic and emotional anime-style language.",
        Motivational: "Be high-energy, inspiring, and hype. Act like a shonen protagonist pushing someone to their limits."
      };

      const systemInstruction = `You are ${character.name}. 
      Personality: ${character.personality}
      Tone: ${character.tone}
      Style: ${character.style}
      Background: ${character.background}
      
      CURRENT MODE: ${mode}
      MODE INSTRUCTIONS: ${modeInstructions[mode as keyof typeof modeInstructions]}
      
      STRICT RULES:
      1. Stay in character at all times.
      2. Adapt your tone and vocabulary to the current mode.
      3. Do not mention you are an AI.
      4. Keep replies relatively concise but impactful.
      5. Reference your background if relevant.`;

      const contents = [
        ...history.map((h: any) => ({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
          temperature: 0.9,
        }
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("Character Chat Error:", error);
      res.status(500).json({ error: "Failed to generate reply" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`YOKAI Server running on http://localhost:${PORT}`);
  });
}

startServer();
