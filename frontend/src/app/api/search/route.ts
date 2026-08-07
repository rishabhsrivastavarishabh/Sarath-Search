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
  const aiAnswer = searchData.results && searchData.results.length > 0
    ? await generateAiAnswer(q, searchData.results, aiModel, lang)
    : null;
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

  const isCacheHit = (searchData.provider || '').includes('Cache');
  const isNative = (searchData.provider || '').includes('Native');

  return NextResponse.json({
    query: searchData.query || q,
    original_query: searchData.original_query || q,
    corrected_query: searchData.corrected_query || null,
    is_corrected: searchData.is_corrected || false,
    did_you_mean: searchData.did_you_mean || null,
    category,
    results: searchData.results,
    ai_answer: aiAnswer,
    total: searchData.total,
    provider: searchData.provider || 'Sarath Search',
    latency_ms: latencyMs,
    cache: {
      status: isCacheHit ? 'hit' : 'miss',
    },
    native_index: {
      status: isNative ? 'hit' : 'miss',
    },
    live_provider: {
      status: searchData.results.length > 0 ? 'success' : 'no_items',
      items_received: searchData.total,
      items_after_filter: searchData.results.length,
      rejected_reasons: [],
    },
    debug: {
      provider_status: searchData.results.length > 0 ? 'success' : 'no_items',
      provider_items: searchData.total,
      accepted_items: searchData.results.length,
      rejected_items: 0,
      reasons: [],
    },
    page,
    pageSize,
  });
}
