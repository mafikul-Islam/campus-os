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

// 2. AI Actions on Note Documents (Summarize, Explain, Flashcards, MCQ, Exam Notes)
app.post("/api/gemini/notes-action", async (req, res) => {
  const { action, content, docName } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required for notes action" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Graceful fallback if API key is missing
    return res.json({
      success: true,
      fallback: true,
      result: getFallbackResult(action, docName, content),
    });
  }

  try {
    let systemPrompt = "";
    let userPrompt = "";
    let responseSchema: any = null;
    let responseMimeType = "text/plain";

    switch (action) {
      case "summarize":
        systemPrompt = "You are an expert academic summarizer. Generate a concise, highly structured, and elegant summary of the provided course materials. Use clear headings, bullet points, and key takeaways.";
        userPrompt = `Analyze the document named "${docName || "Course Note"}" and generate a high-quality summary. Content:\n\n${content}`;
        break;

      case "explain":
        systemPrompt = "You are a friendly, expert university professor. Explain complex academic concepts in extremely clear, simple, and intuitive terms. Use helpful analogies, step-by-step reasoning, and visual structural cues.";
        userPrompt = `Please explain the core concepts of this material in a clear, easy-to-digest way for a student. Document name: "${docName || "Course Note"}". Content:\n\n${content}`;
        break;

      case "examNotes":
        systemPrompt = "You are an elite academic coach. Review the provided notes and compile 'Exam Study Guides' which highlight high-yield definitions, potential exam questions, critical formulas, and high-priority study topics.";
        userPrompt = `Create an exhaustive, high-yield study sheet specifically optimized for exam preparation from the following content of "${docName || "Course Note"}":\n\n${content}`;
        break;

      case "flashcards":
        systemPrompt = "Generate a series of high-quality active recall study flashcards. Provide question and answer pairs.";
        userPrompt = `Based on the following academic notes for "${docName || "Course Note"}", extract 5 key active-recall flashcard question-answer pairs.\n\n${content}`;
        responseMimeType = "application/json";
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The active recall question." },
              answer: { type: Type.STRING, description: "The precise and complete study answer." }
            },
            required: ["question", "answer"]
          }
        };
        break;

      case "mcqs":
        systemPrompt = "Generate top-quality multiple-choice questions (MCQs) for a mock university test.";
        userPrompt = `Based on the following content for "${docName || "Course Note"}", create 4 interactive multiple choice questions with 4 logical options each, highlighting the correct option index (0-3) and a detailed helpful explanation.\n\n${content}`;
        responseMimeType = "application/json";
        responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The multiple choice question." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Four logical option strings."
              },
              answer: { type: Type.INTEGER, description: "The index of the correct answer (0, 1, 2, or 3)." },
              explanation: { type: Type.STRING, description: "Explanation of why this is correct." }
            },
            required: ["question", "options", "answer", "explanation"]
          }
        };
        break;

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType,
        responseSchema,
      }
    });

    const text = response.text || "";
    if (responseMimeType === "application/json") {
      try {
        const parsed = JSON.parse(text);
        return res.json({ success: true, result: parsed });
      } catch (e) {
        console.error("JSON parsing error for response:", text, e);
        return res.status(500).json({ error: "Failed to generate structured JSON response" });
      }
    }

    return res.json({ success: true, result: text });

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: error.message || "Internal AI generation error" });
  }
});

// 3. AI Document Chat (Interactive Q&A based on note context)
app.post("/api/gemini/notes-chat", async (req, res) => {
  const { messages, documentContext, docName } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true,
      fallback: true,
      reply: "Hello! Since the Gemini API Key is not set, I am operating in Sandbox mode. I see you uploaded '" + (docName || "a file") + "'. I can explain normalization or generate dummy flashcards if you ask!"
    });
  }

  try {
    const lastMessage = messages[messages.length - 1]?.content;
    const previousConversation = messages.slice(0, -1).map(m => {
      return `${m.role === "user" ? "Student" : "CampusOS AI"}: ${m.content}`;
    }).join("\n");

    const systemPrompt = `You are CampusOS AI, a premium virtual university academic coach. You are discussing a note document named "${docName || "Lecture"}" with the student.
    Use the document content as context to answer all questions precisely, elegantly, and helpfully.
    Document Context:
    ---
    ${documentContext || "No document loaded yet."}
    ---
    
    Maintain a professional, supportive, and clever tone. Do not make up answers not supported by the notes context, but you are free to add standard university tutoring wisdom to explain concepts cleanly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Chat history:\n${previousConversation}\n\nStudent's latest question: ${lastMessage}\n\nCampusOS AI:`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error("Error in doc chat:", error);
    res.status(500).json({ error: error.message || "Error communicating with AI" });
  }
});

// 4. Parse Expense Text or Voice Transcript
app.post("/api/gemini/parse-expense", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required to parse expense" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Safe mock parser
    const num = text.match(/\d+(\.\d+)?/)?.[0] || "10";
    const amount = parseFloat(num);
    let category = "Others";
    if (text.toLowerCase().includes("food") || text.toLowerCase().includes("coffee") || text.toLowerCase().includes("lunch") || text.toLowerCase().includes("pizza")) {
      category = "Food";
    } else if (text.toLowerCase().includes("bus") || text.toLowerCase().includes("uber") || text.toLowerCase().includes("taxi") || text.toLowerCase().includes("transport")) {
      category = "Transport";
    } else if (text.toLowerCase().includes("book") || text.toLowerCase().includes("course") || text.toLowerCase().includes("education") || text.toLowerCase().includes("tuition")) {
      category = "Education";
    } else if (text.toLowerCase().includes("movie") || text.toLowerCase().includes("game") || text.toLowerCase().includes("concert") || text.toLowerCase().includes("entertainment")) {
      category = "Entertainment";
    }
    return res.json({
      success: true,
      fallback: true,
      parsed: {
        amount,
        category,
        description: text.substring(0, 40)
      }
    });
  }

  try {
    const systemPrompt = `You are a micro-expense extraction engine. Extract precise financial transaction data from natural language sentences.
    The response MUST strictly conform to the JSON schema.
    If the text doesn't explicitly state a category, choose the closest fit from: Food, Transport, Education, Entertainment, Others.
    Assume today is 2026-07-11.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Extract expense details from: "${text}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "The transaction dollar amount." },
            category: { type: Type.STRING, description: "One of: Food, Transport, Education, Entertainment, Others." },
            description: { type: Type.STRING, description: "Clear, brief descriptor of the expense (e.g. 'Starbucks Coffee', 'Subway ticket')." }
          },
          required: ["amount", "category", "description"]
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, parsed });
    } catch (e) {
      console.error("Failed to parse JSON response:", response.text, e);
      return res.status(500).json({ error: "Failed to parse AI structure" });
    }
  } catch (error: any) {
    console.error("Error parsing expense:", error);
    res.status(500).json({ error: error.message || "AI parsing error" });
  }
});

// 5. Coach Chat (Daily Personal Recommendation and Chat Support)
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
      reply: `Hi ${userProfile?.name || "Student"}! This is your AI Student Coach. I notice you're at ${userProfile?.university || "University"}. I can give you study advice, draft review sessions, or help balance your current budget. To activate my full potential, connect the Gemini API key in the secrets drawer.`
    });
  }

  try {
    const lastMsg = messages[messages.length - 1]?.content;
    const chatHistory = messages.slice(0, -1).map(m => {
      return `${m.role === "user" ? "Student" : "Coach"}: ${m.content}`;
    }).join("\n");

    const systemPrompt = systemInstructionOverride || `You are the CampusOS AI Lead Coach and Personal Academic Mentor.
    You understand everything about the student:
    - Name: ${userProfile?.name || "Student"}
    - University: ${userProfile?.university || "University"}
    - Major: ${userProfile?.major || "Computer Science"}
    - CGPA: ${userProfile?.cgpa || "3.6"} (Target: ${userProfile?.targetCgpa || "3.8"})
    - Credits Completed: ${userProfile?.creditsCompleted || "45"} / ${userProfile?.creditsTotal || "120"}
    - Active Classes: ${JSON.stringify(userProfile?.courses || [])}
    
    Give hyper-personalized academic advice, time management tips, deadline strategies, stress-relief guidance, and financial health suggestions. Be brief, encouraging, highly pragmatic, and structure your text with markdown headers, bold words, or bullet points. Avoid clinical or boring blocks of text. Provide 1 specific concrete action item at the end of your response!`;

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

// 6. AI Lecture Assistant
app.post("/api/gemini/lecture-assistant", async (req, res) => {
  const { transcript, title } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: "Transcript is required" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true,
      fallback: true,
      result: {
        summary: `### Lecture Summary of ${title || "Lecture"}\nThis lecture covered foundational principles of the subject. Due to missing API Key, this is a generic high-yield summary.\n- Key Concept 1: Structural decomposition\n- Key Concept 2: Iterative progression`,
        keyConcepts: ["Structural Decomposition", "Iterative Progression", "Dynamic Load Balance"],
        studyPlan: "1. Review notes for 15 mins.\n2. Do Practice set A.\n3. Complete assignment by next Monday."
      }
    });
  }

  try {
    const systemPrompt = `You are the CampusOS AI Lecture Assistant. Generate study materials from lecture transcripts, recording texts, or raw transcripts.
    The response MUST be valid JSON matching the schema provided.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Process the following lecture transcript titled "${title || "Selected Lecture"}":\n\n${transcript}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Detailed academic summary using rich markdown (lists, headers)." },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 3-5 core terminology or concepts taught in this lecture."
            },
            studyPlan: { type: Type.STRING, description: "A beautiful structured study plan step-by-step specifically based on this lecture." }
          },
          required: ["summary", "keyConcepts", "studyPlan"]
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, result: parsed });
    } catch (e) {
      console.error("Lecture assistant JSON parsing failed:", response.text, e);
      return res.status(500).json({ error: "Failed to create structured lecture assets" });
    }
  } catch (error: any) {
    console.error("Error in lecture assistant:", error);
    res.status(500).json({ error: error.message || "Lecture processing failed" });
  }
});

// 7. AI OCR Schedule Routine Import
app.post("/api/gemini/ocr-routine", async (req, res) => {
  const { description } = req.body;
  
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true,
      fallback: true,
      events: [
        { title: "Advanced Database Systems", type: "Class", date: "2026-07-13", time: "09:30 - 11:00", room: "CS-402", course: "CSE 301", color: "blue" },
        { title: "Software Engineering Lab", type: "Class", date: "2026-07-13", time: "13:00 - 15:30", room: "Lab-2", course: "CSE 304", color: "indigo" },
        { title: "Artificial Intelligence Seminar", type: "Class", date: "2026-07-14", time: "11:30 - 13:00", room: "Auditorium", course: "CSE 312", color: "purple" },
        { title: "Database Normalization Exam", type: "Exam", date: "2026-07-16", time: "10:00 - 12:00", room: "Exam Hall A", course: "CSE 301", color: "red" }
      ]
    });
  }

  try {
    const systemPrompt = `You are a scheduling OCR assistant. Parse calendar schedule description and return structured event nodes.
    The response MUST be JSON matching the schema. Translate day-of-week terms to real upcoming dates, assuming today is Saturday, 2026-07-11.
    For instance:
    - Monday is 2026-07-13
    - Tuesday is 2026-07-14
    - Wednesday is 2026-07-15
    - Thursday is 2026-07-16
    - Friday is 2026-07-17
    Provide correct date codes.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Parse these events:\n"${description || "Monday 9:30 AM Database in room CS-402, Tuesday 11:30 AM AI Seminar in Auditorium"}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Name of class, exam, or project milestone." },
              type: { type: Type.STRING, description: "One of: Class, Exam, Assignment, Project, Personal." },
              date: { type: Type.STRING, description: "Date string in YYYY-MM-DD format." },
              time: { type: Type.STRING, description: "Time range (e.g. '09:30 - 11:00')." },
              room: { type: Type.STRING, description: "Room number or lecture hall name." },
              course: { type: Type.STRING, description: "Course code like CSE 301." },
              color: { type: Type.STRING, description: "A simple Tailwind color name like 'blue', 'purple', 'red', 'indigo'." }
            },
            required: ["title", "type", "date", "time"]
          }
        }
      }
    });

    try {
      const events = JSON.parse(response.text || "[]");
      return res.json({ success: true, events });
    } catch (e) {
      console.error("Routine OCR JSON parsing failed:", response.text, e);
      return res.status(500).json({ error: "Failed to extract schedule" });
    }
  } catch (error: any) {
    console.error("Error in routine OCR:", error);
    res.status(500).json({ error: error.message || "Failed to extract schedule" });
  }
});

// 8. Dynamic OCR Schedule Routine parser for Department, Batch, and Section
app.post("/api/routine/parse", async (req, res) => {
  const { fileData, mimeType, fileName, academicProfile } = req.body;
  
  if (!fileData || !mimeType) {
    return res.status(400).json({ error: "fileData and mimeType are required" });
  }

  const major = academicProfile?.major || "Computer Science & Engineering";
  const batch = academicProfile?.batch || "N/A";
  const section = academicProfile?.section || "N/A";
  const semester = academicProfile?.semester || "N/A";

  const ai = getGeminiClient();
  if (!ai) {
    console.log("No GEMINI_API_KEY found, returning premium mock routine tailored to:", { major, batch, section, semester });
    const offsetHour = section.toUpperCase() === 'B' ? 1 : 0;
    const fallbackClasses = [
      {
        id: 'rot-1',
        day: 'Saturday',
        courseName: "Advanced Database Systems",
        courseCode: "CSE 301",
        time: `${9 + offsetHour}:30 - ${11 + offsetHour}:00`,
        room: section.toUpperCase() === 'B' ? "CS-403" : "CS-402",
        teacher: "Dr. JKD"
      },
      {
        id: 'rot-2',
        day: 'Saturday',
        courseName: "Compiler Design Lab",
        courseCode: "CSE 302L",
        time: `13:30 - 16:00`,
        room: "Lab-2",
        teacher: "Mr. MHR"
      },
      {
        id: 'rot-3',
        day: 'Sunday',
        courseName: "Compiler Design",
        courseCode: "CSE 302",
        time: `${9 + offsetHour}:00 - ${10 + offsetHour}:30`,
        room: section.toUpperCase() === 'B' ? "CS-401" : "CS-402",
        teacher: "Mr. MHR"
      },
      {
        id: 'rot-4',
        day: 'Sunday',
        courseName: "Advanced Database Systems",
        courseCode: "CSE 301",
        time: `${11 + offsetHour}:00 - ${12 + offsetHour}:30`,
        room: section.toUpperCase() === 'B' ? "CS-301" : "CS-302",
        teacher: "Dr. JKD"
      },
      {
        id: 'rot-5',
        day: 'Monday',
        courseName: "Software Engineering Lab",
        courseCode: "CSE 304",
        time: `${10 + offsetHour}:30 - ${12 + offsetHour}:00`,
        room: section.toUpperCase() === 'B' ? "CS-402" : "CS-403",
        teacher: "Mrs. ARS"
      },
      {
        id: 'rot-6',
        day: 'Monday',
        courseName: "Artificial Intelligence",
        courseCode: "CSE 312",
        time: `14:00 - 15:30`,
        room: "CS-402",
        teacher: "Prof. SKB"
      },
      {
        id: 'rot-7',
        day: 'Tuesday',
        courseName: "Artificial Intelligence",
        courseCode: "CSE 312",
        time: `${9 + offsetHour}:00 - ${10 + offsetHour}:30`,
        room: section.toUpperCase() === 'B' ? "CS-401" : "CS-402",
        teacher: "Prof. SKB"
      },
      {
        id: 'rot-8',
        day: 'Tuesday',
        courseName: "Advanced Database Systems Lab",
        courseCode: "CSE 301L",
        time: `11:00 - 13:30`,
        room: "Lab-3",
        teacher: "Dr. JKD"
      },
      {
        id: 'rot-9',
        day: 'Wednesday',
        courseName: "Compiler Design",
        courseCode: "CSE 302",
        time: `${10 + offsetHour}:30 - ${12 + offsetHour}:00`,
        room: section.toUpperCase() === 'B' ? "CS-403" : "CS-402",
        teacher: "Mr. MHR"
      },
      {
        id: 'rot-10',
        day: 'Wednesday',
        courseName: "Software Engineering Lab",
        courseCode: "CSE 304",
        time: `13:30 - 15:00`,
        room: "Lab-2",
        teacher: "Mrs. ARS"
      },
      {
        id: 'rot-11',
        day: 'Thursday',
        courseName: "Artificial Intelligence Seminar",
        courseCode: "CSE 312",
        time: `${9 + offsetHour}:00 - ${10 + offsetHour}:30`,
        room: "Auditorium",
        teacher: "Prof. SKB"
      }
    ];

    return res.json({
      success: true,
      fallback: true,
      routineClasses: fallbackClasses
    });
  }

  try {
    const systemPrompt = `You are an expert academic scheduler and timetable parsing system. Analyze the provided file (image, PDF, spreadsheet) which is an institutional or departmental master routine.
    Identify and extract only the classes that are specific to this student profile:
    - Major/Department: ${major}
    - Batch: ${batch}
    - Section: ${section}
    - Semester: ${semester}

    You must match columns, header rows, times, and day blocks. Carefully filter out classes belonging to other departments, sections, or batches.
    Extract the schedule. The response MUST be a JSON object containing a 'routineClasses' array.
    For each matched class, extract:
    1. day: Must be one of "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday".
    2. courseName: Full descriptive name of the course.
    3. courseCode: The code of the course (e.g. CSE 302).
    4. time: The duration of the class, e.g. "09:00 - 10:30".
    5. room: Room number or lecture hall (e.g. CS-402).
    6. teacher: Teacher initials or name (e.g. Mr. MHR).

    If any of these fields are missing from the raw timetable cell, infer them from surrounding context or provide a default. Always return valid JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: fileData
          }
        },
        {
          text: `Extract the weekly class routine specific to Department: ${major}, Batch: ${batch}, Section: ${section}, Semester: ${semester} from this uploaded document named "${fileName || "timetable_file"}".`
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            routineClasses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "One of Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday." },
                  courseName: { type: Type.STRING, description: "Descriptive name of the course." },
                  courseCode: { type: Type.STRING, description: "Academic course code." },
                  time: { type: Type.STRING, description: "Class duration time window (e.g. 10:30 - 12:00)." },
                  room: { type: Type.STRING, description: "The room code or lab identifier." },
                  teacher: { type: Type.STRING, description: "Name or initials of the lecturer." }
                },
                required: ["day", "courseName", "courseCode", "time", "room", "teacher"]
              }
            }
          },
          required: ["routineClasses"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"routineClasses": []}');
    // Add random or predictable unique IDs to parsed classes for list stability
    const routineClassesWithIds = (parsed.routineClasses || []).map((cls: any, index: number) => ({
      ...cls,
      id: `rot-${index + 1}-${Math.random().toString(36).substring(2, 6)}`
    }));

    return res.json({
      success: true,
      routineClasses: routineClassesWithIds
    });

  } catch (error: any) {
    console.error("Error parsing routine via Gemini:", error);
    res.status(500).json({ error: error.message || "Failed to process routine file" });
  }
});

// Helper for local sandbox responses
function getFallbackResult(action: string, docName: string, content: string): any {
  const shortDoc = docName || "Material";
  switch (action) {
    case "summarize":
      return `### Academic Summary: ${shortDoc}\n\nThis high-quality summary was created by the CampusOS offline agent. Connect your API key for advanced reasoning.\n\n* **Core Objective**: Establishes structural guidelines for academic tracking.\n* **Key takeaway**: Attendance of 85% is strictly recommended to avoid falling behind.\n* **Action Item**: Complete all weekly tasks before deadlines to maintain CGPA.`;
    case "explain":
      return `### Professor Explanation: ${shortDoc}\n\nHere is a simple, analogy-based explanation of the content:\n\nImagine this concept like a highly efficient post office. Instead of sorting every single mail manually, we use postcodes. Normalization does exactly that for Databases! It breaks down massive tables to avoid duplicate entries and ensures every data piece has an exact, single address. This prevents any data conflicts!`;
    case "examNotes":
      return `### High-Yield Exam Guide: ${shortDoc}\n\n**🎯 TOP EXAM FOCUS AREAS**\n1. Normalization Normal Forms (1NF, 2NF, 3NF, BCNF) - *Extremely common*\n2. Functional Dependencies and Keys (Candidate vs. Primary)\n3. Relational Decomposition algorithms\n\n**💡 TIP**: Make sure you practice checking if a table is in 3NF by checking if non-prime attributes are transitively dependent!`;
    case "flashcards":
      return [
        { question: "What is the primary goal of Database Normalization?", answer: "To eliminate data redundancy and prevent anomalies during database updates." },
        { question: "Define 1st Normal Form (1NF).", answer: "A relation is in 1NF if and only if all attribute values are atomic (no repeating groups)." },
        { question: "What is BCNF?", answer: "Boyce-Codd Normal Form, a slightly stronger version of 3NF where every determinant must be a candidate key." }
      ];
    case "mcqs":
      return [
        {
          question: "Which Normal Form strictly prohibits transitive dependency?",
          options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "BCNF"],
          answer: 2,
          explanation: "Third Normal Form (3NF) requires a table to be in 2NF, and additionally, no non-prime attribute should be transitively dependent on any candidate key."
        },
        {
          question: "What anomaly occurs when deleting a row removes unrelated critical information?",
          options: ["Update Anomaly", "Insertion Anomaly", "Deletion Anomaly", "Primary Key Anomaly"],
          answer: 2,
          explanation: "A Deletion Anomaly happens when deleting certain records causes the unintended loss of other unrelated data."
        }
      ];
  }
}

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

// Only call listen if not running in a Vercel serverless environment
if (!process.env.VERCEL) {
  startServer();
}

// Export the express app so Vercel serverless functions can use it natively
export default app;

