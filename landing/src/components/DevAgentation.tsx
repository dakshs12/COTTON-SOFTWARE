"use client";

import { useEffect, useState } from "react";
import { Agentation } from "agentation";

/**
 * Renders Agentation tool ONLY on localhost / local development.
 * Automatically hidden on live domains (e.g. cottbook.com, www.cottbook.com, and vercel.app).
 */
export default function DevAgentation() {
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.endsWith(".local")
      ) {
        setIsLocalhost(true);
      }
    }
  }, []);

  if (!isLocalhost) {
    return null;
  }

  return (
    <div className="print:hidden">
      <Agentation />
    </div>
  );
}
