import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to initialize Gemini client lazily and safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Real AI responses will fall back to mock answers.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES FIRST
// ----------------------------------------------------

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Coach Chat (Daily Personal Recommendation and Chat Support)
app.post("/api/gemini/coach-chat", async (req, res) => {
  const { messages, userProfile, systemInstructionOverride } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages list is required" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true,
      fallback: true,
      reply: `Hi ${userProfile?.name || "Student"}! This is your AI Student Coach. To activate my full potential, connect the Gemini API key in the secrets drawer or your Vercel Environment variables.`
    });
  }

  try {
    const lastMsg = messages[messages.length - 1]?.content;
    const chatHistory = messages.slice(0, -1).map((m: any) => {
      return `${m.role === "user" ? "Student" : "Coach"}: ${m.content}`;
    }).join("\n");

    const systemPrompt = systemInstructionOverride || `You are the CampusOS AI Lead Coach and Personal Academic Mentor. Give helpful academic advice.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `History:\n${chatHistory}\n\nStudent's Input: ${lastMsg}\n\nCoach:`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      }
    });

    return res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error("Error in Coach chat:", error);
    res.status(500).json({ error: error.message || "Coach AI error" });
  }
});

// ----------------------------------------------------
// VITE OR STATIC FILE SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CampusOS AI] Server successfully running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();

