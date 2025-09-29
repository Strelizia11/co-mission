import { NextResponse } from 'next/server';
import { getFreelancerProfile, updateFreelancerProfile } from '@/lib/db';

// POST add portfolio item
export async function POST(req: Request) {
  try {
    const { email, portfolioItem } = await req.json();

    if (!email || !portfolioItem) {
      return NextResponse.json({ error: 'Email and portfolio item are required' }, { status: 400 });
    }

    const profile = getFreelancerProfile(email);
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Generate unique ID for portfolio item
    const newItem = {
      ...portfolioItem,
      id: Date.now().toString(),
      completedAt: portfolioItem.completedAt || new Date().toISOString()
    };

    const updatedPortfolio = [...profile.portfolio, newItem];
    const success = updateFreelancerProfile(email, { portfolio: updatedPortfolio });
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to add portfolio item' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Portfolio item added successfully',
      portfolioItem: newItem 
    });
  } catch (error) {
    console.error('Error adding portfolio item:', error);
    return NextResponse.json({ error: 'Failed to add portfolio item' }, { status: 500 });
  }
}

// PUT update portfolio item
export async function PUT(req: Request) {
  try {
    const { email, itemId, updates } = await req.json();

    if (!email || !itemId || !updates) {
      return NextResponse.json({ error: 'Email, item ID, and updates are required' }, { status: 400 });
    }

    const profile = getFreelancerProfile(email);
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const updatedPortfolio = profile.portfolio.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );

    const success = updateFreelancerProfile(email, { portfolio: updatedPortfolio });
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Portfolio item updated successfully',
      portfolioItem: updatedPortfolio.find(item => item.id === itemId)
    });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
  }
}

// DELETE portfolio item
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const itemId = searchParams.get('itemId');

    if (!email || !itemId) {
      return NextResponse.json({ error: 'Email and item ID are required' }, { status: 400 });
    }

    const profile = getFreelancerProfile(email);
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const updatedPortfolio = profile.portfolio.filter(item => item.id !== itemId);
    const success = updateFreelancerProfile(email, { portfolio: updatedPortfolio });
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}
