import { useEffect, useState } from "react";

interface Deal {
  client: string;
  value: number;
  status: string;
}

interface SalesRep {
  id: number;
  name: string;
  region: string;
  deals: Deal[];
  skills: string[];
}

export default function SalesPage() {
  const [data, setData] = useState<SalesRep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/data");
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        setData(json.salesReps || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter(
    (rep) =>
      rep.name.toLowerCase().includes(search.toLowerCase()) ||
      rep.region.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  if (error) return <p className="text-center text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Sales Representatives</h1>

        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search by name or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded shadow-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm bg-white shadow rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Region</th>
                <th className="px-4 py-2 border">Skills</th>
                <th className="px-4 py-2 border">Deals</th>
                <th className="px-4 py-2 border">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((rep) => {
                const totalValue = rep.deals.reduce((sum, deal) => sum + deal.value, 0);
                return (
                  <tr key={rep.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border font-medium">
                      {rep.name} <span className="text-gray-400 text-xs">({rep.deals.length} deals)</span>
                    </td>
                    <td className="px-4 py-2 border">{rep.region}</td>
                    <td className="px-4 py-2 border">{rep.skills.join(", ")}</td>
                    <td className="px-4 py-2 border text-left">
                      <ul className="list-disc list-inside space-y-1">
                        {rep.deals.map((deal, i) => (
                          <li key={i}>
                            {deal.client} (${deal.value}) –{" "}
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                deal.status === "won"
                                  ? "bg-green-100 text-green-700"
                                  : deal.status === "lost"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {deal.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2 border font-semibold text-right">${totalValue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <p className="text-center text-gray-500 mt-6">No sales reps found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
