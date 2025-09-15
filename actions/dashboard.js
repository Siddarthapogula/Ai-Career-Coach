"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
export const generateAiInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutLook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;
  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: prompt,
  });
  const text = response.text;
  const cleanedText = text.replace(/```(?:json)?\n?|\n?```/g, "").trim();
  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) return;
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include : {IndustryInsight : true}
  });
  if (!user) return { status: false, message: "user not found" };
  if (!user?.IndustryInsight) {
    const insights = await generateAiInsights(user?.industry);
    const industryInsight = await prisma.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return {status : true, industryInsight}
  } 
  return user?.IndustryInsight;
}
