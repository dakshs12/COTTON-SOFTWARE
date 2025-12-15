"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

// Define what a "Party" looks like so TypeScript is happy
interface Party {
  id: number;
  company_name: string;
  station: string;
  mobile: string;
}

export default function Home() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  // This runs when the page loads
  useEffect(() => {
    // We use 127.0.0.1 to avoid Windows network issues
    axios.get('http://127.0.0.1:8000/api/parties/')
      .then((response) => {
        setParties(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-black">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-700">Cotton Broker Software</h1>
        <p className="text-gray-600">Welcome back, Broker.</p>
      </header>
      
      {loading ? (
        <p className="text-lg">Loading data from Python...</p>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Party Master List</h2>
          {parties.length === 0 ? (
            <p className="text-gray-500">No parties found. Add some in the Admin Panel!</p>
          ) : (
            <ul className="space-y-3">
              {parties.map((party) => (
                <li key={party.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div>
                    <span className="font-bold block">{party.company_name}</span>
                    <span className="text-sm text-gray-500">{party.station}</span>
                  </div>
                  <span className="text-blue-600 font-mono">{party.mobile}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}