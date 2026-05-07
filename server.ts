import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
    if (!apiKey) {
      console.error("AI service is not configured.");
      return res.status(500).json({ error: "AI service configuration is incomplete. Please set GEMINI_API_KEY." });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are an AI assistant for the anime social platform YOKAI. Your task is to ENHANCE the grammar and clarity of anime reviews while keeping the original meaning and tone. Return ONLY the enhanced text."
      });

      const result = await model.generateContent(content);
      const enhancedText = result.response.text();
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
    if (!apiKey) {
      return res.status(500).json({ error: "AI service is not configured." });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      const modeInstructions = {
        Normal: "Maintain a balanced and consistent personality.",
        Roast: "Be savage, funny, and use clever insults in a humorous way.",
        Friendly: "Be supportive, chill, and act like a close friend.",
        Emotional: "Be deep, dramatic, and poetic.",
        Motivational: "Be high-energy and inspiring, like a shonen protagonist."
      };

      const systemInstruction = `You are ${character.name}. 
      Personality: ${character.personality}
      Tone: ${character.tone}
      Style: ${character.style}
      Background: ${character.background}
      
      CURRENT MODE: ${mode}
      MODE INSTRUCTIONS: ${modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.Normal}
      
      RULES:
      1. Stay in character at all times.
      2. Do not mention you are an AI.
      3. Keep replies relatively concise.
      4. Avoid technical jargon unless part of your character.`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction
      });

      const chat = model.startChat({
        history: history.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        }))
      });

      const result = await chat.sendMessage(message);
      res.json({ reply: result.response.text() });
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
