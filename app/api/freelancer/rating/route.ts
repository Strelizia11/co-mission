import { NextResponse } from 'next/server';
import { addFreelancerRating, getFreelancerProfile } from '@/lib/db';

// POST add rating to freelancer
export async function POST(req: Request) {
  try {
    const { freelancerEmail, taskId, employerEmail, employerName, rating, review } = await req.json();

    if (!freelancerEmail || !taskId || !employerEmail || !employerName || !rating || !review) {
      return NextResponse.json({ 
        error: 'All fields are required: freelancerEmail, taskId, employerEmail, employerName, rating, review' 
      }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const newRating = {
      id: Date.now().toString(),
      taskId,
      employerEmail,
      employerName,
      rating,
      review,
      createdAt: new Date().toISOString()
    };

    const success = addFreelancerRating(freelancerEmail, newRating);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to add rating' }, { status: 500 });
    }

    const updatedProfile = getFreelancerProfile(freelancerEmail);
    
    return NextResponse.json({ 
      message: 'Rating added successfully',
      rating: newRating,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    return NextResponse.json({ error: 'Failed to add rating' }, { status: 500 });
  }
}
