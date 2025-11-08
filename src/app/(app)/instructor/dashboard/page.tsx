import InstructorDashboard from '@/components/dashboard/instructor/InstructorDashboard';
import { Suspense } from 'react';

export default function InstructorDashboardPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
       <Suspense fallback={<div>Loading...</div>}>
        <InstructorDashboard />
       </Suspense>
    </div>
  );
}
