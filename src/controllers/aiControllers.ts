import { AuthRequest } from "../middlewares/authMiddleware";
import { Response } from "express";
import axios from "axios";
import { Note } from "../models/noteModle";
import { Quiz } from "../models/quizQuestionModle";
import { Flashcard } from "../models/flashCardModle";
import { Summary } from "../models/summeryModle";
import { Explanation } from "../models/explanationModle";
import { chunkText } from "../util/chunkText";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile"; 

// remove HTML tags 
const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ");
};

// 1. Get Summary
export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Not found Notes.!" });

    const text = stripHtml(note.html || "");
    const chunks = chunkText(text, 4000); 
    let combinedText = "";

    for (const chunk of chunks) {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: MODEL,
          messages: [{ role: "user", content: `Summarize this text briefly:\n${chunk}` }],
          temperature: 0.5,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      combinedText += response.data.choices[0].message.content + "\n";
    }

    const savedSummary = await Summary.create({
      noteId: note._id,
      userId: req.user._id,
      summaryText: combinedText,
    });

    res.status(200).json({ summary: combinedText });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Groq Summarization failed!" });
  }
};

// 2. Get Explanation
export const getExplanation = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Not found Notes.!" });

    const text = stripHtml(note.html || "");

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [{ role: "user", content: `Explain the core concepts of this note in simple terms:\n${text.substring(0, 6000)}` }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.choices[0].message.content;

    await Explanation.create({
      noteId: note._id,
      userId: req.user._id,
      explanation: result,
    });

    res.status(200).json({ explanation: result });
  } catch (error: any) {
    res.status(500).json({ message: "Groq Explanation failed!" });
  }
};

// 3. Get Quiz Questions (JSON Output)
export const getQuizQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found!" });

    const prompt = `Create a quiz with 5 MCQs based on this text. Return ONLY a raw JSON array.
    Schema: [{"question": "string", "options": ["A", "B", "C", "D"], "correctAnswer": "string"}]
    Text: ${stripHtml(note.html).substring(0, 6000)}`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // Groq supports JSON mode
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawContent = response.data.choices[0].message.content;
    const quizData = JSON.parse(rawContent).questions || JSON.parse(rawContent);

    const newQuiz = await Quiz.create({
      userId: req.user._id,
      noteId,
      questions: quizData,
    });

    res.status(200).json({ questions: quizData, quizId: newQuiz._id });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: "Groq Quiz generation failed!" });
  }
};

// 4. Get Flashcards (JSON Output)
export const getFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found!" });

    const prompt = `Create 6 flashcards from this text. Return ONLY a raw JSON array.
    Format: [{"front": "Question", "back": "Answer"}]
    Text: ${stripHtml(note.html).substring(0, 6000)}`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawContent = response.data.choices[0].message.content;
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Invalid JSON from AI");

    const flashcardsJson = JSON.parse(jsonMatch[0]);

    const flashcardsData = flashcardsJson.map((card: any) => ({
      noteId: note._id,
      userId: req.user._id,
      front: card.front,
      back: card.back,
    }));

    const savedCards = await Flashcard.insertMany(flashcardsData);
    res.status(200).json({ flashcards: savedCards });
  } catch (error: any) {
    res.status(500).json({ message: "Groq Flashcard generation failed!" });
  }
};

// 5. Auto Generate Note based on Title, Word Count, and Subject
export const generateAutoNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, wordCount, subjectId, subjectName } = req.body;
    const userId = req.user._id;

    // Validation
    if (!title || !wordCount || !subjectId) {
      return res.status(400).json({ message: "Title, Word Count, and Subject ID are required!" });
    }

    const prompt = `
      Write a comprehensive educational note for Sri Lankan A/L Grade 12 students.
      Title: ${title}
      Subject: ${subjectName}
      Approximate Word Count: ${wordCount} words
      
      Language Instructions:
      - Use SINHALA as the primary language for explanations.
      - Mandatory: Include English technical terms in brackets next to their Sinhala terms. 
        (Example: මිනිස් අවශ්‍යතා (Human Needs), නිෂ්පාදන සාධක (Factors of Production)).
      
      Structure:
      1. Introduction with definitions.
      2. Key concepts with bullet points.
      3. Detailed explanations.
      
      Format: Professional HTML using <h2>, <p>, <ul>, <li>.
      Return ONLY the HTML content.
    `;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedHtml = response.data.choices[0].message.content;

    // Create the Note in Database
    const newNote = await Note.create({
      title,
      html: generatedHtml,
      json: JSON.stringify({ generated: true, title }), // Basic JSON structure
      subjectId,
      userId,
      images: [],
      isTrashed: false
    });

    res.status(201).json({
      message: "Note auto-generated and saved successfully!",
      note: newNote
    });

  } catch (error: any) {
    console.error("Auto Gen Error:", error.response?.data || error.message);
    res.status(500).json({ message: "AI Note generation failed!" });
  }
};