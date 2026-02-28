import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectDB from '@/config/database';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    
    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || 'whsec_test');

    let evt;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occurred', { status: 400 });
    }

    // Handle the webhook
    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { email_addresses, first_name, last_name, image_url } = evt.data;
      
      // Check if user already exists
      const existingUser = await User.findOne({ clerkId: id });
      if (existingUser) {
        return new Response('User already exists', { status: 200 });
      }

      // Create new user
      const newUser = new User({
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name || '',
        lastName: last_name || '',
        imageUrl: image_url || '',
        role: 'farmer',
        profile: {
          bio: '',
          location: '',
          phone: '',
          avatar: image_url || ''
        }
      });

      await newUser.save();
      console.log('User created:', newUser._id);
    }

    if (eventType === 'user.updated') {
      const { email_addresses, first_name, last_name, image_url } = evt.data;
      
      await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: email_addresses[0].email_address,
          firstName: first_name || '',
          lastName: last_name || '',
          imageUrl: image_url || ''
        }
      );
      console.log('User updated:', id);
    }

    if (eventType === 'user.deleted') {
      await User.findOneAndDelete({ clerkId: id });
      console.log('User deleted:', id);
    }

    return new Response('', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}