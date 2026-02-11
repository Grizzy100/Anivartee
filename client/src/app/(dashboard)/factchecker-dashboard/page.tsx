import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import Feed from '@/components/dashboard/Feed';
import RightPanel from '@/components/dashboard/RightPanel';
import { mockPendingPosts } from '@/lib/mockData';

export default function FactcheckerDashboardPage() {
  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="ml-[260px] mr-[320px] min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          <Feed 
            title="Pending Fact-Checks"
            subtitle="Posts awaiting verification and expert review"
            posts={mockPendingPosts}
          />
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
