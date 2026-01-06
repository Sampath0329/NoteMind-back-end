import { AuthRequest } from "../middlewares/authMiddleware";
import { Response } from "express";
import { Note } from "../models/noteModle";
import path from "path";
import fs from "fs-extra";
import puppeteer from "puppeteer";
import cloudinary from "../config/cloudinaryConfig";
import { Subject } from "../models/subjectModle";

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    console.log(req.body)
    const { title, html, json, subjectId } = req.body;
    const images: string[] = req.body?.images || [];
    const pdfUrl: string | undefined = req.body?.pdfUrl;
    const userId = req.user._id;

    if (!title || !html || !json || !subjectId || !userId) {
      return res.status(400).json({ message: "Note not have a content...!" });
    }

    const note = await Note.create({
      title,
      html,
      json,
      images,
      pdfUrl,
      subjectId,
      userId,
    });
    console.log("Saved Note in DB:", note);

    res
      .status(201)
      .json({ message: "Note Created Successfully...!", data: note });
  } catch (error) {
    res.status(500).json({ message: "Note Creation Failed...!" });
  }
};

export const getAllNotes = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const totalNotesCount = await Note.countDocuments({ userId: req.user._id, isTrashed: false });

    const notes = await Note.find({ userId: req.user._id, isTrashed: false })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalPages = Math.ceil(totalNotesCount / limit);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalNotesCount,
      notes,
    });
  } catch (error) {
    res.status(500).json({ message: "Note fetched Failed...!" });
  }
};

export const getNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    const note = await Note.findOne({ userId: userId, _id: noteId });

    res.status(200).json({
      message: "Note fetched Successfully...!",
      note,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "One Note fetched Failed...!" });
  }
};

export const updateNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    const { title, html, json, subjectId } = req.body;
    const images: string[] = req.body?.images || [];
    const pdfUrl: string | undefined = req.body?.pdfUrl;
    const userId = req.user._id;

    if (!title || !html || !json || !subjectId || !userId) {
      return res.status(400).json({ message: "Note not have a content...!" });
    }
    console.log('upadate')
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        title,
        html,
        json,
        images,
        pdfUrl,
        subjectId,
        userId,
      },
      { new: true } // update una note eka return karanna
    );
    res
      .status(201)
      .json({ message: "Note updated Successfully...!", data: updatedNote });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Note update Failed...!" });
  }
};

export const deleteNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;

    const deletedNote = await Note.findByIdAndUpdate(noteId, { isTrashed: true });
    res
      .status(200)
      .json({ message: "Note deleted Successfully...!", data: deletedNote });
  } catch (error) {
    res.status(500).json({ message: "Note delete Failed...!" });
  }
};

export const pdfGeneration = async (req: AuthRequest, res: Response) => {
  let browser; // borwser variable, function scope 
  try {
    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found...!" });
    }

    const htmlContent = note.html || "<p>(Empty Note)</p>";
    const tempPath = path.join("temp", `${noteId}.pdf`);
    
    // 1. Check if the folder exists, if not create it
    if (!fs.existsSync("temp")) {
      fs.mkdirSync("temp");
    }

    // 2. Puppeteer Launch options improvement (Essential for running on servers)
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    
    // Providing a complete HTML structure is advisable 
    await page.setContent(`
      <html>
        <head><style>body { font-family: sans-serif; padding: 20px; }</style></head>
        <body>${htmlContent}</body>
      </html>
    `, {
      waitUntil: "networkidle0", // waiting for network to be idle
      timeout: 60000 
    });

    await page.pdf({
      path: tempPath,
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" }
    });

    await browser.close();
    browser = null; // close unoth variable eka null karanawa

    // Cloudinary Upload for PDF
    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      resource_type: "raw", // using the "raw" resource type for PDF files
      folder: "notes_pdfs",
      public_id: `${noteId}_pdf`,
      overwrite: true
    });

    // // File delete 
    // if (fs.existsSync(tempPath)) {
    //   await fs.unlink(tempPath);
    // }

    return res.status(200).json({
      message: "PDF generated successfully!",
      pdfUrl: uploadResult.secure_url,
    });

  } catch (error: any) {
    // closing browser if it's still open
    if (browser) await browser.close();
    
    console.error("PDF Generation Error:", error);
    res.status(500).json({ 
      message: "PDF generation Failed...!", 
      error: error.message 
    });
  }
};

export const noteBySubjectId = async (req: AuthRequest, res: Response) => {
  try {
    const subId = req.params.id;

    const subject = await Subject.findById(subId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found...!" });
    }

    const notes = await Note.find({ subjectId: subId });

    res.status(200).json({
      message: "Notes fetched Successfully...!",
      notes,
    });

  } catch (error) {
    res.status(500).json({ message: "Note fetched Failed...!" });
  }
}

export const noteSearchByTitle = async (req: AuthRequest, res: Response) => {
  try {
    const titleQuery = req.query.q as string;
    const userId = req.user._id;

    console.log(titleQuery)
    if (!titleQuery) {
      return res.status(400).json({ message: "Title query parameter is required." });
    }

    const notes = await Note.find({
      userId,
      $or: [
        { title: { $regex: titleQuery, $options: "i" } },
        { html: { $regex: titleQuery, $options: "i" } },
      ],
    });

    res.status(200).json({
      message: "Search results",
      results: notes,
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Note fetched Failed...!" });
  }
}

export const getTrashedNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { isTrashed: true, userId: userId };

    const totalNotesCount = await Note.countDocuments(query);

    const notes = await Note.find(query)
      .sort({ updatedAt: -1 }) 
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalNotesCount / limit);

    res.status(200).json({ 
        notes,
        pagination: {
            currentPage: page,
            totalPages,
            totalNotesCount,
            limit
        }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch trashed notes" });
  }
};

export const restoreNote = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findByIdAndUpdate(noteId, { isTrashed: false });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note restored successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Failed to restore note" });
  }
};

export const deleteNotePermanently = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findByIdAndDelete(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete note" });
  }
};

export const searchNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const searchQuery = req.query.q as string; 

    if (!searchQuery || searchQuery.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const notes = await Note.find({
      userId: userId,       
      isTrashed: false,     
      $or: [
        { title: { $regex: searchQuery, $options: "i" } }, 
        { html: { $regex: searchQuery, $options: "i" } }   
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Search results found",
      count: notes.length,
      notes: notes, 
    });

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};
