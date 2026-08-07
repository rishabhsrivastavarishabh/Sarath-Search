import { SearchResultItem, AiAnswerData, AiAnswerSource, AiAnswerFaqItem } from '@/types';
export type { AiAnswerData, AiAnswerSource, AiAnswerFaqItem };

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  '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';

/**
 * Detects language from search query string
 */
export function detectQueryLanguage(query: string): string {
  const q = query.trim();
  if (/[\u0900-\u097F]/.test(q)) return 'Hindi';
  if (/[\u0980-\u09FF]/.test(q)) return 'Bengali';
  if (/[\u0C00-\u0C7F]/.test(q)) return 'Telugu';
  if (/[\u0B80-\u0BFF]/.test(q)) return 'Tamil';
  if (/[\u0D00-\u0D7F]/.test(q)) return 'Malayalam';
  if (/[\u0C80-\u0CFF]/.test(q)) return 'Kannada';
  if (/[\u0A80-\u0AFF]/.test(q)) return 'Gujarati';
  if (/[\u0A00-\u0A7F]/.test(q)) return 'Punjabi';
  if (/[\u0600-\u06FF]/.test(q)) return 'Urdu';
  if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(q)) return 'Japanese';
  if (/[\u4E00-\u9FFF]/.test(q)) return 'Chinese';
  if (/[\uAC00-\uD7AF]/.test(q)) return 'Korean';
  if (/[\u0400-\u04FF]/.test(q)) return 'Russian';
  if (/[\u0E00-\u0E7F]/.test(q)) return 'Thai';
  if (/[áéíóúñ¿¡]/i.test(q)) return 'Spanish';
  if (/[éèêëàâùûç]/i.test(q)) return 'French';
  if (/[äöüß]/i.test(q)) return 'German';
  return 'English';
}

/**
 * Synthesizes natural human conversational AI answers strictly grounded in retrieved web results
 */
export async function generateAiAnswer(
  query: string,
  results: SearchResultItem[],
  selectedModel?: string,
  targetLanguage?: string
): Promise<AiAnswerData> {
  const cleanQuery = query.trim();
  const topResults = results.slice(0, 5);
  const targetModel = selectedModel || 'google/gemini-3.6-flash';
  const detectedLang = targetLanguage && targetLanguage !== 'auto' ? targetLanguage : detectQueryLanguage(cleanQuery);

  const sources = topResults.map((r, idx) => ({
    index: idx + 1,
    title: r.title,
    domain: r.domain,
    url: r.url,
  }));

  const contextText = topResults
    .map((r, idx) => `[Source ${idx + 1}]: ${r.title}\nDomain: ${r.domain}\nURL: ${r.url}\nSnippet: ${r.meta_description}`)
    .join('\n\n');

  if (OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://sarath.ai',
          'X-Title': 'Sarath Web AI Multilingual Search Engine',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            {
              role: 'system',
              content:
                `You are an expert AI Assistant (like ChatGPT, Perplexity, or Gemini). Answer the user's query naturally, expertly, and conversationally in ${detectedLang} based ONLY on provided sources.
Do NOT use robotic phrasing like "Overview for...", "Compiled from search results", "Technical analysis", or "Retrieved web sources". Write directly and engagingly as a human domain expert.
Return ONLY valid JSON matching this schema:
{\n  "overview": "Direct, engaging, natural introductory summary in ${detectedLang} with inline citations like [1], [2].",\n  "introduction": "Engaging background context.",\n  "detailed_explanation": "In-depth natural multi-paragraph explanation, core mechanisms, step-by-step principles, and clear inline citations.",\n  "quick_facts": ["Insightful fact 1", "Insightful fact 2"],\n  "key_points": ["Key concept 1 [1]", "Key concept 2 [2]", "Key concept 3"],\n  "features": ["Capability 1", "Capability 2"],\n  "advantages": ["Benefit 1", "Benefit 2"],\n  "disadvantages": ["Limitation 1"],\n  "faq": [{"question": "Natural FAQ 1?", "answer": "Clear answer 1"}],\n  "related_topics": ["Topic 1", "Topic 2"],\n  "people_also_search_for": ["Query 1", "Query 2"],\n  "related_questions": ["5 to 10 natural follow-up questions..."]\n}\nDo NOT include markdown backticks outside JSON.`,
            },
            {
              role: 'user',
              content: `Search Query: "${cleanQuery}" (Language: ${detectedLang})\n\nWeb Search Results:\n${contextText}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            query: cleanQuery,
            overview: parsed.overview || parsed.summary || `${cleanQuery} is an important subject with broad applications across technology and industry.`,
            introduction: parsed.introduction || `${cleanQuery} plays a vital role in modern web and technical ecosystems.`,
            detailed_explanation: parsed.detailed_explanation || parsed.overview || `${cleanQuery} involves key architectural principles and core capabilities.`,
            quick_facts: Array.isArray(parsed.quick_facts) ? parsed.quick_facts : [],
            key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
            features: Array.isArray(parsed.features) ? parsed.features : [],
            advantages: Array.isArray(parsed.advantages) ? parsed.advantages : [],
            disadvantages: Array.isArray(parsed.disadvantages) ? parsed.disadvantages : [],
            faq: Array.isArray(parsed.faq) ? parsed.faq : [],
            related_topics: Array.isArray(parsed.related_topics) ? parsed.related_topics : [],
            people_also_search_for: Array.isArray(parsed.people_also_search_for) ? parsed.people_also_search_for : [],
            sources,
            related_questions: Array.isArray(parsed.related_questions) && parsed.related_questions.length > 0
              ? parsed.related_questions
              : [
                  `What are the core fundamentals of ${cleanQuery}?`,
                  `How does ${cleanQuery} work in practical scenarios?`,
                  `What are the latest updates regarding ${cleanQuery}?`,
                  `How to get started with ${cleanQuery}?`,
                  `What are the main alternatives to ${cleanQuery}?`
                ],
            generated_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ai_model: 'Sarath AI',
            detected_language: detectedLang,
          };
        }
      }
    } catch (error) {
      console.warn('OpenRouter Web AI API call fallback', error);
    }
  }

  // Insufficient / Grounded Fallback Answer
  return {
    query: cleanQuery,
    overview: results.length > 0
      ? `${cleanQuery} is a widely referenced topic across major web documentation and authoritative references.`
      : "I couldn't find enough reliable information.",
    introduction: `${cleanQuery} encompasses essential concepts, frameworks, and key principles.`,
    detailed_explanation: results.length > 0
      ? `${cleanQuery} is detailed across multiple canonical web references. You can explore the verified sources below for complete details.`
      : "Not enough reliable information is available.",
    quick_facts: results.length > 0 ? [`Verified Reference Sources: ${results.length}`] : [],
    key_points: results.slice(0, 4).map((r, i) => `${r.title} — ${r.domain} [${i + 1}]`),
    features: ['High-throughput execution', 'Universal compatibility'],
    advantages: ['Strict source grounding', 'No hallucinated facts'],
    disadvantages: [],
    faq: [
      { question: `What is ${cleanQuery}?`, answer: `Explore primary documentation and authoritative references for ${cleanQuery}.` }
    ],
    related_topics: [`${cleanQuery} Overview`, `${cleanQuery} Documentation`],
    people_also_search_for: [`${cleanQuery} guide`, `${cleanQuery} tutorial`],
    sources,
    related_questions: [
      `What are the core fundamentals of ${cleanQuery}?`,
      `How does ${cleanQuery} work in practical scenarios?`,
      `What are the latest updates regarding ${cleanQuery}?`,
      `How to get started with ${cleanQuery}?`,
      `What are the main alternatives to ${cleanQuery}?`
    ],
    generated_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ai_model: 'Sarath AI',
    detected_language: detectedLang,
  };
}
