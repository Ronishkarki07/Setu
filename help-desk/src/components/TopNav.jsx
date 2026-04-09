export default function TopNav() {
  return (
    <header className="flex justify-between px-8 h-14 bg-white border-b">
      <div className="flex gap-6 items-center">
        <span className="font-bold text-[#DC143C]">Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        <input
          className="bg-gray-100 px-3 py-1 rounded"
          placeholder="Search..."
        />
        <div className="w-9 h-9 bg-[#0d1b3e] text-white rounded-full flex items-center justify-center">
          JT
        </div>
      </div>
    </header>
  );
}