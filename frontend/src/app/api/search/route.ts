import { NextRequest, NextResponse } from 'next/server';
import { performDuckDuckGoSearch } from '@/lib/search-provider';
import { generateAiAnswer } from '@/lib/ai-answer';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const userId = searchParams.get('userId') || null;
  const aiModel = searchParams.get('aiModel') || undefined;
  const lang = searchParams.get('lang') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  if (!q.trim()) {
    return NextResponse.json({
      query: '',
      results: [],
      ai_answer: null,
      total: 0,
      provider: 'Sarath Search',
      page,
      pageSize,
    });
  }

  const startTime = Date.now();

  const searchData = await performDuckDuckGoSearch(q, category, page, pageSize);
  const aiAnswer = await generateAiAnswer(q, searchData.results, aiModel, lang);
  const latencyMs = Date.now() - startTime;

  // Insert into search_analytics
  try {
    await supabaseAdmin.from('search_analytics').insert({
      query: q,
      results_count: searchData.results.length,
      latency_ms: latencyMs,
      country: 'US',
      device: 'desktop',
      browser: 'chrome',
    });
  } catch (err) {
    // Non-blocking analytics logging
  }

  return NextResponse.json({
    query: q,
    category,
    results: searchData.results,
    ai_answer: aiAnswer,
    total: searchData.total,
    provider: 'Sarath Search',
    page,
    pageSize,
    latency_ms: latencyMs,
  });
}
