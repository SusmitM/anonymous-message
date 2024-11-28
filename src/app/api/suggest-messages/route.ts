import OpenAI from "openai";

export const runtime = "edge";

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  console.log("this is key",process.env.OPENAI_API_KEY)
  const prompt =
    "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction.";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content || "No response generated.";
    return new Response(content, { status: 200 });
  } catch (error) {
    console.error("Error during OpenAI request:", error);
    return new Response("Failed to fetch response from OpenAI.", { status: 500 });
  }
}
