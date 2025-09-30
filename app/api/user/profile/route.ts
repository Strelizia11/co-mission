import { NextResponse } from 'next/server';
import { getFreelancerProfile, getEmployerProfile } from '@/lib/db';

// GET user profile by email (works for both freelancers and employers)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Try to get as freelancer first
    let profile = getFreelancerProfile(email);
    let userType = 'freelancer';

    // If not found as freelancer, try as employer
    if (!profile) {
      profile = getEmployerProfile(email);
      userType = 'employer';
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      profile: {
        ...profile,
        userType
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
