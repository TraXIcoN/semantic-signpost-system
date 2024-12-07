import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    console.log(
      "API Key:",
      process.env.PINECONE_API_KEY ? "Present" : "Missing"
    );

    // Initialize Pinecone
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log("Pinecone initialized");

    const index = pc.index("capstone");
    console.log("Index accessed");

    // Get query parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const topK = parseInt(searchParams.get("topK") || "10");

    console.log("Query:", query);

    // If no query provided, fetch random samples
    if (!query) {
      console.log("No query, fetching random samples");
      try {
        const results = await index.query({
          vector: Array(384).fill(0), // Match your index dimension
          topK,
          includeMetadata: true,
        });
        console.log("Random results:", results);
        return NextResponse.json(results.matches);
      } catch (e) {
        console.error("Error querying random samples:", e);
        throw e;
      }
    }

    // Get embeddings from Hugging Face
    console.log("Getting embedding for query");
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: query,
          options: {
            wait_for_model: true,
            pooling: "mean",
            normalize: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const embeddings = await response.json();
    console.log("Got embedding, dimensions:", embeddings.length);

    // Ensure we have a proper embedding array
    if (!Array.isArray(embeddings) || embeddings.length !== 384) {
      throw new Error(
        `Invalid embedding dimensions: got ${embeddings.length}, expected 384`
      );
    }

    const results = await index.query({
      vector: embeddings,
      topK,
      includeMetadata: true,
    });

    console.log("Got Pinecone results");
    return NextResponse.json(results.matches);
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch data",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
