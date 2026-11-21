import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Keep-alive endpoint - dipanggil Vercel Cron harian
 * agar project Supabase free tier tidak dijeda.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('catalog')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 'ok',
      catalog_count: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: String(err) },
      { status: 500 }
    );
  }
}
