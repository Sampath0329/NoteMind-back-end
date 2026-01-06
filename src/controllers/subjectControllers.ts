import { AuthRequest } from "../middlewares/authMiddleware";
import { Response } from "express";
import { Subject } from "../models/subjectModle";

export const saveSubject = async (req: AuthRequest, res: Response) => {

  try {
    const { subject } = req.body;
    console.log(subject)
    const userId = req.user._id;
    // console.log(" userId:", userId);

    if (!subject) {
      return res.status(400).json({ message: "Subject name is required...!" });
    }

    const newSubject = await Subject.create({
      name: subject,
      userId: userId,
    });

    res.status(201).json({ 
      message: "Subject created Successfully...!", 
      data: newSubject });

  } catch (error) {
    res.status(500).json({ message: "Subject creation Failed...!" });
  }

}

export const getSubjects = async (req: AuthRequest, res: Response) => {

  try {
    const userId = req.user._id;
    console.log(" userId:", userId);

    const subjects = await Subject.find({ userId: userId });

    res.status(200).json({ 
      message: "Subjects fetched Successfully...!", 
      data: subjects });
    
  } catch (error) {
    res.status(500).json({ message: "Subject fetch Failed...!" });
  }
};

export const getSubjectsById = async (req: AuthRequest, res: Response) => {

  try {
    const subjectId = req.params.id;
    const userId = req.user._id;

    const subjects = await Subject.find({ userId: userId , _id: subjectId });

    res.status(200).json({ 
      message: "Subjects fetched Successfully...!", 
      data: subjects });
    
  } catch (error) {
    res.status(500).json({ message: "Subject fetch Failed...!" });
  }
};

export const  updateSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { subject } = req.body;
    const subjectId = req.params.id;

    if (!subject) {
      return res.status(400).json({ message: "Subject name is required...!" });
    }

    const newSubject = await Subject.findByIdAndUpdate(
      { _id: subjectId },
      { name : subject }
    );

    res.status(201).json({ 
      message: "Subject created Successfully...!", 
      data: newSubject });

  } catch (error) {
    res.status(500).json({ message: "Subject update Failed...!" });
  }

};

export const deleteSubject = async (req: AuthRequest, res: Response) => {
  try {
    const subjectId = req.params.id;

    const deletedSubject = await Subject.findByIdAndDelete({ _id: subjectId });

    res.status(200).json({ 
      message: "Subject deleted Successfully...!" ,
      data: deletedSubject });
    
  } catch (error) {
    res.status(500).json({ message: "Subject delete Failed...!" });
  }
};