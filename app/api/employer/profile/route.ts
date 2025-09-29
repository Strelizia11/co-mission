import { NextResponse } from 'next/server';
import { getEmployerProfile, updateEmployerProfile } from '@/lib/db';

// GET employer profile
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const profile = getEmployerProfile(email);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT update employer profile
export async function PUT(req: Request) {
  try {
    const { email, ...profileData } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const success = updateEmployerProfile(email, profileData);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 });
    }

    const updatedProfile = getEmployerProfile(email);
    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating employer profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}


