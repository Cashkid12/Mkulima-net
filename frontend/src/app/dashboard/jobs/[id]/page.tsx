'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function JobDetailsRedirect() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main job details page
    router.push(`/jobs/${id}`);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-600">Redirecting to job details...</p>
      </div>
    </div>
  );
}