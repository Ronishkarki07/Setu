import { useState, useEffect } from "react";
import Layout from "../components/Layout";

/* MOCK DATA */
const MOCK_RECENT = [
  {
    id: "#TK-44291",
    title: "Course Registration Error: CSC-302",
    desc: "System prevents enrollment due to prerequisite mismatch...",
    status: "In Progress",
  },
  {
    id: "#TK-44182",
    title: "ID Card Replacement Request",
    desc: "Lost original ID card during campus sports event....",
    status: "Resolved",
  },
];

export default function Dashboard() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = { name: "Jeshika" };

  useEffect(() => {
    setTimeout(() => {
      setRecent(MOCK_RECENT);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <Layout>
      <div className="p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold">Welcome back,</h1>
        <h1 className="text-3xl font-bold text-[#DC143C] mb-6">
          {user.name}
        </h1>

        {/* STATS */}
        <div className="flex gap-4 mb-8">
          {[
            { label: "Total Tickets", value: "24" },
            { label: "Active", value: "03" },
            { label: "Resolved", value: "21" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-xl flex-1 shadow"
            >
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* RECENT */}
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>

        {loading ? (
          <p className="text-gray-500">Loading tickets...</p>
        ) : recent.length === 0 ? (
          <p className="text-gray-500">No tickets found</p>
        ) : (
          recent.map((r) => (
            <div
              key={r.id}
              className="bg-white p-4 rounded-xl mb-3 shadow hover:shadow-md cursor-pointer"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">{r.title}</p>
                  <p className="text-sm text-gray-500">{r.desc}</p>
                </div>

                <span
                  className={`px-2 py-1 rounded text-sm ${
                    r.status === "Resolved"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))
        )}

      </div>
    </Layout>
  );
}