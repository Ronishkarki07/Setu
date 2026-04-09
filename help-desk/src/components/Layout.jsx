import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function Layout({ children }) {
  return (
    <div className="bg-[#f0f2f7] text-[#0d1b3e]">
      
      {/* FIXED SIDEBAR */}
      <div className="fixed left-0 top-0 h-screen z-50">
        <Sidebar />
      </div>

      {/* MAIN AREA WITH TOP NAV FIXED */}
      <div className="ml-56"> 
        <div className="fixed top-0 left-56 right-0 z-40">
          <TopNav />
        </div>

        {/* CONTENT SCROLLS */}
        <div className="pt-14 p-5 min-h-screen overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}