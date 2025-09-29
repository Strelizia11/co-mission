import { NextResponse } from 'next/server';
import { getAllFreelancerProfiles } from '../../../../lib/db';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET all freelancer profiles (for employers to browse)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const skills = searchParams.get('skills');
    const minRating = searchParams.get('minRating');
    const availability = searchParams.get('availability');

    let profiles = getAllFreelancerProfiles();

    // Filter by skills if provided
    if (skills) {
      const requiredSkills = skills.split(',').map(s => s.trim().toLowerCase());
      profiles = profiles.filter(profile => 
        requiredSkills.some(skill => 
          profile.skills.some(profileSkill => 
            profileSkill.toLowerCase().includes(skill)
          )
        )
      );
    }

    // Filter by minimum rating if provided
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      if (!isNaN(minRatingNum)) {
        profiles = profiles.filter(profile => profile.averageRating >= minRatingNum);
      }
    }

    // Filter by availability if provided
    if (availability) {
      profiles = profiles.filter(profile => profile.availability === availability);
    }

    // Sort by average rating (highest first)
    profiles.sort((a, b) => b.averageRating - a.averageRating);

    return NextResponse.json({ profiles }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Error fetching freelancer profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}
