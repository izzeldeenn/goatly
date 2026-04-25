import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key if available, otherwise fall back to anon key
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// GET - Fetch product code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseService
      .from('developer_products')
      .select('id, code, code_type, code_version, sandbox_config')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product code:', error);
      return NextResponse.json({ error: 'Failed to fetch product code' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!data.code) {
      return NextResponse.json({ error: 'Product has no code' }, { status: 400 });
    }

    return NextResponse.json({
      productId: data.id,
      code: data.code,
      codeType: data.code_type,
      codeVersion: data.code_version,
      sandboxConfig: data.sandbox_config
    });
  } catch (error) {
    console.error('Error in GET /api/developer-products/[id]/code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
