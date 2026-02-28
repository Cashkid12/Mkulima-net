import { clerkClient } from '@clerk/clerk-sdk-node';
import connectDB from '@/config/database';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    
    const { userId, email, firstName, lastName, imageUrl } = await req.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: userId });
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'User already exists',
          user: existingUser
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create new user in our database
    const newUser = new User({
      clerkId: userId,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      imageUrl: imageUrl || '',
      role: 'farmer', // default role
      profile: {
        bio: '',
        location: '',
        phone: '',
        avatar: imageUrl || ''
      }
    });
    
    await newUser.save();
    
    // Update Clerk user metadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: 'farmer',
        databaseId: newUser._id.toString()
      }
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'User created successfully',
        user: newUser
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to create user',
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}