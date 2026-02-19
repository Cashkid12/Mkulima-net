import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path as needed
import { connectDB } from '@/lib/mongodb'; // Adjust path as needed
import User from '@/models/User'; // Adjust path as needed

export async function PUT(req: NextRequest) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized: Please log in to update your profile' },
        { status: 401 }
      );
    }

    // Parse the request body
    const profileData = await req.json();

    // Connect to database
    await connectDB();

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      { _id: session.user.id },
      {
        $set: {
          name: profileData.name,
          username: profileData.username,
          farmName: profileData.farmName,
          location: profileData.location,
          bio: profileData.bio,
          skills: profileData.skills,
          certifications: profileData.certifications,
          services: profileData.services,
          crops: profileData.crops,
          livestock: profileData.livestock,
          farmSize: profileData.farmSize,
          yearsExperience: profileData.yearsExperience,
          experienceLevel: profileData.experienceLevel,
          availabilityStatus: profileData.availabilityStatus,
          farmImages: profileData.farmImages,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('-password'); // Don't return the password

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET route to fetch profile data
export async function GET(req: NextRequest) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized: Please log in to view your profile' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the user
    const user = await User.findById(session.user.id).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile fetched successfully',
      data: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}