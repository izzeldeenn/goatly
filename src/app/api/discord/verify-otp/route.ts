import { NextRequest, NextResponse } from 'next/server';
import { discordOTPDB, supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userHashKey, otpCode } = await request.json();

    if (!userHashKey || !otpCode) {
      return NextResponse.json(
        { error: 'Missing required fields: userHashKey and otpCode' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = await discordOTPDB.verifyOTP(userHashKey, otpCode);

    if (isValid) {
      // Mark Discord as linked in database
      const { error } = await supabase
        .from('users')
        .update({ discord_linked: true })
        .eq('hash_key', userHashKey);

      if (error) {
        console.error('Error updating Discord link status:', error);
        return NextResponse.json(
          { error: 'Failed to update Discord link status' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { success: true, message: 'OTP verified successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying Discord OTP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
