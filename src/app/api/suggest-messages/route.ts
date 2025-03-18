import { FALLBACK_SUGGESTIONS } from '@/data/FallbackSuggestions';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

const prompt = `Generate exactly three short, open-ended personal questions in a single line. Each question should be concise and separated by '||'. Do not include any explanations or formatting instructions. Time: ${new Date().toISOString()}`;

export const config = {
  runtime: 'edge', 
};

// Helper function to get random items from an array
function getRandomItems(array: string[], count: number): string[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

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
    
    // Always use fallback suggestions for any error
    console.log("Using fallback suggestions due to API error or unavailability");
    
    // Get 3 random questions from our fallback dataset
    const fallbackQuestions = getRandomItems(FALLBACK_SUGGESTIONS, 3);
    const fallbackResponse = fallbackQuestions.join(' || ');
    
    return new Response(JSON.stringify({
      success: true,
      message: fallbackResponse,
      source: 'fallback' // Optional: Include this to track when fallback is used
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}