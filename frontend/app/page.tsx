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
    <div className="max-w-7xl mx-auto neu-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="neu-page-title text-3xl">Dashboard</h1>
          <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>
            Welcome back, Broker. Here is your business overview.
          </p>
        </div>
      </div>
      
      {loading ? (
        <p className="text-base" style={{ color: "var(--cb-text-label)" }}>
          Loading data from server...
        </p>
      ) : (
        <div className="neu-card p-6 max-w-2xl">
          <h2
            className="text-xl font-bold mb-5 pb-3"
            style={{
              color: "var(--cb-text-heading)",
              borderBottom: "2px solid var(--cb-divider)",
              fontFamily: "var(--font-playfair-display), 'Playfair Display', serif",
            }}
          >
            Party Master List
          </h2>
          {parties.length === 0 ? (
            <p style={{ color: "var(--cb-text-label)" }}>
              No parties found. Add some in the Party Master!
            </p>
          ) : (
            <ul className="space-y-2">
              {parties.map((party) => (
                <li
                  key={party.id}
                  className="flex justify-between items-center p-3 rounded-xl transition-colors duration-150"
                  style={{ borderRadius: "var(--cb-radius-sm)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#dde3eb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }}
                >
                  <div>
                    <span
                      className="font-bold block text-sm"
                      style={{ color: "var(--cb-text-heading)" }}
                    >
                      {party.company_name}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--cb-text-label)" }}
                    >
                      {party.station}
                    </span>
                  </div>
                  <span
                    className="font-mono text-sm font-medium"
                    style={{ color: "var(--cb-primary)" }}
                  >
                    {party.mobile}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}