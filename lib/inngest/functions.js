// import { genAI } from "@/actions/dashboard";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "../prisma";
import { inngest } from "./client";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}` };
  }
);

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" },
  async ({ step }) => {
    const industries = await step.run("Fetch Industries", async () => {
      return await prisma.industryInsight.findMany({
        select: { industry: true },
      });
    });
    for (const { industry } of industries) {
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
      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          const response = await genAI.models.generateContent({
            model: "gemini-2.0-flash-001",
            contents: p,
          });
          return response;
        },
        prompt
      );
      const text = res.candidates[0].content.parts[0].text || "";
      const cleanedText = text.replace(/```(?:json)?\n?|\n?```/g, "").trim();
      const insights = JSON.parse(cleanedText);
      const updated = await step.run(`Update ${industry}`, async () => {
        return await prisma.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
    return { status: true, message: "success" };
  }
);
