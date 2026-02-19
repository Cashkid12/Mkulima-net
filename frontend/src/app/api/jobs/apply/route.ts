import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { jobId, userId, coverLetter } = await request.json();

    // In a real application, this would connect to your backend API
    // For now, we'll return a mock response
    const response = await fetch(`${process.env.BACKEND_URL}/api/jobs/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`
      },
      body: JSON.stringify({
        jobId,
        userId,
        coverLetter
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to apply for job' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully applied for job',
      applicationId: data.applicationId 
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}