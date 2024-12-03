import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

const prompt = `Generate exactly three short, open-ended personal questions in a single line. Each question should be concise and separated by '||'. Do not include any explanations or formatting instructions. Time: ${new Date().toISOString()}`;

export const config = {
  runtime: 'edge', 
};

export async function GET(req: Request) {
  try {
    const response = await hf.textGeneration({
      model: 'Qwen/Qwen2.5-1.5B-Instruct',
      inputs: prompt,
      parameters: {
        max_new_tokens: 50,
        temperature: Math.random() * (1 - 0.6) + 0.6, 
        top_p: 0.9,
      },
    });


    const text = response.generated_text || '';
  
    const cleanText = text.startsWith(prompt) ? text.slice(prompt.length).trim() : text;

    // Split and process the questions
    const questions = cleanText.split('||').map((q) => q.trim());
    const validQuestions = questions.slice(0, 3).filter((q) => q); 
    const finalResponse = validQuestions.join(' || ');

    return new Response(JSON.stringify({
      success: true,
      message: finalResponse
    }), {
      headers: { 'Content-Type': 'application/json' }, 
    });

  } catch (error) {
    console.error("Error during Hugging Face request:", error);
    return new Response("Failed to fetch response.", { status: 500 });
  }
}