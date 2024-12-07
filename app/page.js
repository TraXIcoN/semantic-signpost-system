"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("timeline");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/timeline?query=${encodeURIComponent(query)}`);
  };

  const searchArticles = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/fetchEmbeddings?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: [1, -1, 1, -1, 0], // Shaking effect
      transition: {
        duration: 0.5,
        rotate: {
          duration: 0.5,
          ease: "easeInOut",
        },
      },
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc] overflow-hidden flex items-center justify-center">
      <div className="container mx-auto p-4 flex flex-col items-center max-w-4xl">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center text-[#8B4513]"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to the Semantic Timeline
        </motion.h1>

        {/* Tabs */}
        <div className="bg-[#DEB887] rounded-lg p-1 inline-flex mb-8">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-6 py-2 rounded-md transition-all duration-300 ${
              activeTab === "timeline"
                ? "bg-[#f5f5dc] text-[#8B4513]"
                : "text-[#f5f5dc] hover:bg-[#f5f5dc]/10"
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`px-6 py-2 rounded-md transition-all duration-300 ${
              activeTab === "search"
                ? "bg-[#f5f5dc] text-[#8B4513]"
                : "text-[#f5f5dc] hover:bg-[#f5f5dc]/10"
            }`}
          >
            Search Articles
          </button>
        </div>

        {/* Content Container */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            custom={activeTab === "timeline" ? -1 : 1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full max-w-2xl"
          >
            <form
              onSubmit={
                activeTab === "timeline" ? handleSearch : searchArticles
              }
              className="mb-8 flex flex-col items-center"
            >
              <input
                type="text"
                placeholder={
                  activeTab === "timeline"
                    ? "Enter query for timeline view..."
                    : "Search articles..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#DEB887] focus:outline-none focus:border-[#8B4513] bg-white shadow-md transition-all duration-300 hover:shadow-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#DEB887] text-[#8B4513] px-6 py-3 rounded-lg font-semibold hover:bg-[#CD853F] transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loading
                  ? "Loading..."
                  : activeTab === "timeline"
                  ? "View Timeline"
                  : "Search Articles"}
              </button>
            </form>

            {/* Results */}
            {activeTab === "search" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {results.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-md border border-[#DEB887] hover:shadow-lg transition-all duration-300"
                  >
                    <h2 className="font-bold text-[#8B4513] text-lg mb-2">
                      {result.metadata?.title || "No title"}
                    </h2>
                    <p className="text-[#8B4513]/80">
                      Score: {result.score.toFixed(4)}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
