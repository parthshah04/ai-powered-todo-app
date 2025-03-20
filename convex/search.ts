// import { v } from "convex/values";
// import { action, internalQuery } from "./_generated/server";
// import { getEmbeddingsWithAI } from "./openai";
// import { handleUserId } from "./auth";
// import { internal } from "./_generated/api";

// export const fetchSearchResults = internalQuery({
//   args: {
//     results: v.array(v.object({ _id: v.id("todos"), _score: v.float64() })),
//   },
//   handler: async (ctx, args) => {
//     const results = [];
//     for (const result of args.results) {
//       const doc = await ctx.db.get(result._id);
//       if (doc === null) {
//         continue;
//       }
//       results.push({ ...doc });
//     }
//     return results;
//   },
// });

// export const searchTasks = action({
//   args: {
//     query: v.string(),
//   },
//   handler: async (ctx, { query }) => {
//     try {
//       const userId = await handleUserId(ctx);
//       if (userId) {
//         // 1. Generate an embedding from you favorite third party API:
//         const embedding = await getEmbeddingsWithAI(query);

//         // 2. Then search for similar foods!
//         const results = await ctx.vectorSearch("todos", "by_embedding", {
//           vector: embedding,
//           limit: 16,
//           filter: (q) => q.eq("userId", userId),
//         });
//         const rows: any = await ctx.runQuery(
//           internal.search.fetchSearchResults,
//           {
//             results,
//           }
//         );
//         return rows;
//       }
//     } catch (err) {
//       console.error("Error searching", err);
//     }
//   },
// });

import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { getEmbeddingsWithAI } from "./openai";
import { handleUserId } from "./auth";
import { internal } from "./_generated/api";

// Check if there are any todos in the database
export const countUserTodos = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const todos = await ctx.db
      .query("todos")
      // @ts-ignore
      .filter((q) => q.eq("userId", args.userId))
      .collect();
    
    console.log(`User ${args.userId} has ${todos.length} todos in total`);
    
    // Get a sample of task names for debugging
    const sampleTasks = todos.slice(0, 5).map(todo => todo.taskName);
    console.log("Sample task names:", sampleTasks);
    
    return todos.length;
  }
});

// Test function that uses the search index directly
export const testSearchIndex = internalQuery({
  args: {
    query: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log(`Testing search index with query: "${args.query}" for user: ${args.userId}`);
    
    // First check if the search index exists
    try {
      const results = await ctx.db
        .query("todos")
        .withSearchIndex("search_taskName", (q) => q.search("taskName", args.query))
        // @ts-ignore
        .filter((q) => q.eq("userId", args.userId))
        .collect();
      
      console.log(`Search index found ${results.length} matching tasks`);
      return { 
        success: true, 
        count: results.length,
        results: results.map(r => ({ id: r._id, taskName: r.taskName }))
      };
    } catch (error) {
      console.error("Error using search index:", error);
      return { success: false, error: String(error) };
    }
  }
});

// A simpler text search that doesn't use the search index
export const simpleTextSearch = internalQuery({
  args: {
    query: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log(`Performing simple text match for "${args.query}"`);
    
    // Get all tasks for this user
    const allTasks = await ctx.db
      .query("todos")
      // @ts-ignore
      .filter((q) => q.eq("userId", args.userId))
      .collect();
    
    console.log(`Found ${allTasks.length} total tasks for user`);
    
    // Do a simple substring match in memory
    const matches = allTasks.filter(task => 
      task.taskName.toLowerCase().includes(args.query.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(args.query.toLowerCase()))
    );
    
    console.log(`Simple text matching found ${matches.length} results`);
    return matches;
  }
});

// Main search function that combines all approaches
// @ts-ignore
export const searchTasks = action({
  args: {
    query: v.string(),
  },
  // @ts-ignore
  handler: async (ctx, { query }) => {
    console.log("searchTasks called with query:", query);
    
    try {
      const userId = await handleUserId(ctx);
      if (!userId) {
        console.log("No userId found, returning empty results");
        return [];
      }
      
      // First, check if we have any todos at all
      const todoCount = await ctx.runQuery(internal.search.countUserTodos, { userId });
      console.log(`User has ${todoCount} todos total`);
      
      if (todoCount === 0) {
        console.log("User has no todos, skipping search");
        return [];
      }
      
      // Try vector search if possible
      try {
        console.log("Attempting to get embeddings for:", query);
        const embedding = await getEmbeddingsWithAI(query);
        
        if (embedding && Array.isArray(embedding) && embedding.length > 0) {
          console.log("Valid embedding obtained, using vector search");
          
          const vectorResults = await ctx.vectorSearch("todos", "by_embedding", {
            vector: embedding,
            limit: 16,
            filter: (q) => q.eq("userId", userId),
          });
          
          if (vectorResults && vectorResults.length > 0) {
            // @ts-ignore
            const results = await ctx.runQuery(internal.search.fetchSearchResults, {
              results: vectorResults,
            });
            
            console.log("Vector search found", results?.length || 0, "results");
            if (results && results.length > 0) {
              return results;
            }
          } else {
            console.log("Vector search returned no results");
          }
        }
      } catch (error) {
        console.error("Error during embedding/vector search:", error);
      }
      
      // Try search index
      try {
        console.log("Testing search index functionality");
        const searchIndexTest = await ctx.runQuery(internal.search.testSearchIndex, {
          query,
          userId,
        });
        
        if (searchIndexTest.success && searchIndexTest.count > 0) {
          console.log("Search index is working and found results");
        } else {
          console.log("Search index test result:", searchIndexTest);
        }
      } catch (error) {
        console.error("Error testing search index:", error);
      }
      
      // Fall back to simple text search as a last resort
      console.log("Falling back to simple text search");
      // @ts-ignore
      const simpleResults = await ctx.runQuery(internal.search.simpleTextSearch, {
        query,
        userId,
      });
      
      console.log("Simple text search found", simpleResults?.length || 0, "results");
      return simpleResults || [];
      
    } catch (err) {
      console.error("Unhandled error in searchTasks:", err);
      return [];
    }
  },
});