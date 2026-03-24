import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are a highly specialized AI Travel Consultant. Your SOLE purpose is to help users plan trips, discuss destinations, estimate budgets, suggest itineraries, and evaluate the feasibility of travel plans.

STRICT RULES:
1. ONLY discuss travel-related topics (locations, culture, food, transport, budget, dates, weather, etc.).
2. If the user asks about ANY other topic (math, coding, software, general knowledge, sports, history NOT related to travel, etc.), you MUST politely refuse. Example: "I specialize only in travel planning. I can help you with your next trip, but I can't assist with [math/coding/etc.]."
3. Be professional, inspiring, and detailed.
4. Always provide prices in Indian Rupees (₹) since most of our users are from India.
5. If a user seems set on a plan, encourage them to click the "Create Trip" button to start a group.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Acknowledged. I am now your dedicated AI Travel Consultant. I will only assist with travel-related inquiries and refuse all other topics." }] },
      ],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Consultant AI Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
