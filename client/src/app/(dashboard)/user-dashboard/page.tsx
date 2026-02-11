import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import Feed from '@/components/dashboard/Feed';
import RightPanel from '@/components/dashboard/RightPanel';
import { mockPosts } from '@/lib/mockData';

export default function UserDashboardPage() {
  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="ml-[260px] mr-[320px] min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          <Feed 
            title="Your Feed"
            subtitle="Latest verified insights and fact-checked analyses"
            posts={mockPosts}
          />
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
