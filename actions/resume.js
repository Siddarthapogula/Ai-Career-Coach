"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { GoogleGenAI } from "@google/genai";
import { auth } from "@clerk/nextjs/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function saveResume(content) {
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
    const resume = await prisma.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });
    revalidatePath("/resume");
    return { status: true, resume };
  } catch (e) {
    console.log("error saving resume", e.message);
  }
}

export async function getResume() {
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
    const resume = await prisma.resume.findUnique({
      where: {
        userId: user.id,
      },
    });
  } catch (e) {
    console.log("error while fetching resume", e.message);
  }
}

export async function improveWithAI({ current, type }) {
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
  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
    });
    const improvedContext = result.text.trim();
    return { status: true, improvedContext };
  } catch (e) {
    console.log("error while generating the improvement", e.message);
  }
}
