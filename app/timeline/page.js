"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

// Create a separate component for the timeline content
function TimelineContent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "";

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching data for query:", query);

        const response = await fetch(
          `/api/v1/fetchEmbeddings?query=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch data: ${errorData.error || response.statusText}`
          );
        }

        const result = await response.json();
        console.log("Received data:", result);

        const sortedData = result.sort((a, b) => {
          const dateA = a.metadata?.datestamp || a.metadata?.date;
          const dateB = b.metadata?.datestamp || b.metadata?.date;

          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;

          return new Date(dateB) - new Date(dateA); // Descending order
        });

        setData(sortedData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [query]);

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-[#DEB887] mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#8B4513]">
              Timeline Results
            </h1>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#DEB887] text-[#8B4513] rounded-lg 
                       hover:bg-[#CD853F] transition-all duration-300 
                       shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              ← Back to Search
            </button>
          </div>

          {/* Query Display */}
          <div className="p-4 bg-[#f5f5dc] rounded-lg border border-[#DEB887]">
            <p className="text-[#8B4513]">
              <span className="font-semibold">Current Query:</span>{" "}
              {query || "No query provided"}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="font-bold text-red-700 mb-2">Error:</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Timeline Content */}
        {!loading && !error && (
          <div className="transition-all duration-300 ease-in-out">
            {data && data.length > 0 ? (
              <VerticalTimeline>
                {data.map((item, index) => (
                  <VerticalTimelineElement
                    key={index}
                    className="vertical-timeline-element"
                    contentStyle={{
                      background: "white",
                      border: "2px solid #DEB887",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    contentArrowStyle={{ borderRight: "7px solid #DEB887" }}
                    date={
                      item.metadata?.datestamp
                        ? new Date(item.metadata.datestamp).toLocaleDateString()
                        : item.metadata?.date
                        ? new Date(item.metadata.date).toLocaleDateString()
                        : ""
                    }
                    iconStyle={{ background: "#DEB887", color: "#8B4513" }}
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="font-bold text-[#8B4513] text-lg">
                        {item.metadata?.title || "No title"}
                      </h3>
                      <div className="text-[#8B4513]/80 text-sm space-y-1">
                        <p>
                          Date:{" "}
                          {item.metadata?.datestamp
                            ? new Date(
                                item.metadata.datestamp
                              ).toLocaleDateString()
                            : item.metadata?.date
                            ? new Date(item.metadata.date).toLocaleDateString()
                            : "No date"}
                        </p>
                        <p>Score: {item.score.toFixed(4)}</p>
                        <p className="truncate">
                          <span className="font-medium">Link: </span>
                          <a
                            href="#"
                            className="text-blue-600 hover:underline"
                            title={`https://example.com/${Math.random()
                              .toString(36)
                              .substring(7)}`}
                          >
                            {`https://example.com/${Math.random()
                              .toString(36)
                              .substring(7)}...`}
                          </a>
                        </p>
                      </div>
                      {item.metadata?.content && (
                        <p className="text-[#8B4513]/70 mt-2">
                          {item.metadata.content}
                        </p>
                      )}
                    </div>
                  </VerticalTimelineElement>
                ))}
              </VerticalTimeline>
            ) : (
              <div className="text-center p-8 text-[#8B4513]">
                No results found for your query
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function TimelinePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f5dc] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
        </div>
      }
    >
      <TimelineContent />
    </Suspense>
  );
}
