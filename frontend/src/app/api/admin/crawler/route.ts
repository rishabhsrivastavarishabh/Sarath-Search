import { NextRequest, NextResponse } from 'next/server';
import { runCrawlerBatchJob, bootstrapSeedWebsites } from '@/lib/web-crawler-engine';
import { successResponse, errorResponse } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/crawler — Returns live website counts, crawl queue status, and system stats
 */
export async function GET() {
  try {
    const { count: websitesCount } = await supabaseAdmin.from('websites').select('*', { count: 'exact', head: true });
    const { count: pendingWebsitesCount } = await supabaseAdmin.from('websites').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: pagesCount } = await supabaseAdmin.from('indexed_pages').select('*', { count: 'exact', head: true });
    const { count: queueCount } = await supabaseAdmin.from('submitted_urls').select('*', { count: 'exact', head: true });

    const { data: recentWebsites } = await supabaseAdmin
      .from('websites')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return successResponse({
      total_websites: websitesCount || 0,
      pending_websites: pendingWebsitesCount || 0,
      total_indexed_pages: pagesCount || 0,
      crawl_queue_length: queueCount || 0,
      recent_discovered_websites: recentWebsites || [],
      status: 'active',
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch crawler status', 500);
  }
}

/**
 * POST /api/admin/crawler — Triggers an automated crawler batch job & seed bootstrapping
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'run';
    const batchSize = body.batchSize || 5;

    if (action === 'bootstrap') {
      const inserted = await bootstrapSeedWebsites();
      return successResponse({ message: `Bootstrapped ${inserted} seed websites into database.`, inserted });
    }

    const stats = await runCrawlerBatchJob(batchSize);
    return successResponse({
      message: 'Crawler batch execution completed successfully.',
      stats,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Crawler execution error', 500);
  }
}
