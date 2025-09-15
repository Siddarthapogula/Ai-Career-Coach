"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) {
    return { status: false, message: "user not logged in" };
  }
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    return { status: false, message: "user not stored in the database!" };
  }
  try {
    const prompt = `  
    Generate 3 technical interview questions for a ${
      user?.industry
    } professional${
      user?.skills?.length
        ? ` with expertise in ${user?.skills.join(", ")}`
        : ""
    }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
    });
    const text = result.text;
    const cleanedText = text.replace(/```(?:json)?\n?|\n?```/g, "").trim();
    const quiz = JSON.parse(cleanedText);
    return { status: true, questions: quiz?.questions };
  } catch (e) {
    console.log(e);
    return { status: false, message: "failed to generate the quiz" };
  }
}

export async function SaveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) {
    return { status: false, message: "user not logged in" };
  }
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    return { status: false, message: "user not stored in the database!" };
  }
  const questionsResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionsResults.filter((q) => !q.isCorrect);
  let improvementTip = null;
  if (wrongAnswers?.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          ` Question : ${q.question}"\n correct answer : ${q.answer}"\n User Answer : ${q.userAnswer}`
      )
      .join("\n\n");
    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;
    try {
      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: improvementPrompt,
      });
      improvementTip = result.text.trim();
    } catch (e) {
      console.log("Error while generating the improvement tip ", e.message);
      return {
        status: false,
        message: "Error while generating the improvement tip",
      };
    }
    try {
      const assessment = await prisma.assessment.create({
        data: {
          userId: user?.id,
          quizScore: score,
          questions: questionsResults,
          category: "Technical",
          improvementTip,
        },
      });
      return { status: true, assessment };
    } catch (e) {
      return {
        status: false,
        message: "Error while generating the improvement tip",
      };
    }
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) {
    return { status: false, message: "user not logged in" };
  }
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    return { status: false, message: "user not stored in the database!" };
  }

  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "asc" },
    });
    return { status: true, assessments };
  } catch (e) {
    console.log(e.message);
  }
}
