import { NextRequest, NextResponse } from 'next/server';
import { performDuckDuckGoSearch } from '@/lib/search-provider';
import { generateAiAnswer } from '@/lib/ai-answer';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const userId = searchParams.get('userId') || null;

  if (!q.trim()) {
    return NextResponse.json({
      query: '',
      results: [],
      ai_answer: null,
      total: 0,
      provider: 'Sarath Search',
    });
  }

  const startTime = Date.now();

  const searchData = await performDuckDuckGoSearch(q, category);
  const aiAnswer = generateAiAnswer(q, searchData.results);
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

  // Insert into search_history if userId provided or guest record
  try {
    await supabaseAdmin.from('search_history').insert({
      query: q,
      category,
      user_id: userId || null,
      searched_at: new Date().toISOString(),
    });
  } catch (err) {
    // Non-blocking history logging
  }

  return NextResponse.json({
    query: q,
    category,
    results: searchData.results,
    ai_answer: aiAnswer,
    total: searchData.total,
    provider: 'Sarath Search',
    latency_ms: latencyMs,
  });
}
