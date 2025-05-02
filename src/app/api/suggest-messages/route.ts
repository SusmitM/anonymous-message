import { FALLBACK_SUGGESTIONS } from '@/data/FallbackSuggestions';

export const config = {
  runtime: 'edge', 
};

// Helper function to get random items from an array
function getRandomItems(array: string[], count: number): string[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function GET(req: Request) {

  const questions = getRandomItems(FALLBACK_SUGGESTIONS, 3);
  const response = questions.join(' || ');
  
  return new Response(JSON.stringify({
    success: true,
    message: response
  }), {
    headers: { 'Content-Type': 'application/json' }, 
  });
}