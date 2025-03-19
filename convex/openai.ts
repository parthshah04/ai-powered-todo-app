import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

import OpenAI from "openai";
import { Id } from "./_generated/dataModel";

const apiKey = process.env.OPENAI_API_KEY;
console.log("🚀 ~ apiKey:", apiKey)
const openai = new OpenAI({ apiKey });

export const suggestMissingItemsWithAi = action({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    try {
      // Retrieve todos for the user
      const todos = await ctx.runQuery(api.todos.getTodosByProjectId, { projectId });
      const project = await ctx.runQuery(api.projects.getProjectByProjectId, { projectId });
      const projectName = project?.name || "";

      // Call OpenAI API for suggestions
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "I'm a project manager and I need help identifying missing to-do items. I have a list of existing tasks in JSON format, containing objects with 'taskName' and 'description' properties. I also have a good understanding of the project scope. Can you help me identify 5 additional to-do items for the project with projectName that are not yet included in this list? Please provide these missing items in a separate JSON array with the key 'todos' containing objects with 'taskName' and 'description' properties. Ensure there are no duplicates between the existing list and the new suggestions.",
          },
          {
            role: "user",
            content: JSON.stringify({ todos, projectName }),
          },
        ],
        response_format: { type: "json_object" },
        model: "gpt-3.5-turbo",
      });

      // Parse the response
      const messageContent = response.choices[0].message?.content;
      if (!messageContent) {
        return null;
      }
      const items = JSON.parse(messageContent)?.todos ?? [];
      const AI_LABEL_ID = "k57exc6xrw3ar5e1nmab4vnbjs6v1m4p";

      // Create todos based on suggestions, managing errors in embeddings as well
      for (let i = 0; i < items.length; i++) {
        const { taskName, description } = items[i];
        let embedding = [];
        try {
          embedding = await getEmbeddingsWithAI(taskName);
        } catch (embedError) {
          console.error("Error getting embedding for task:", taskName, embedError);
          // Continue with empty embedding or a default value
        }
        await ctx.runMutation(api.todos.createATodo, {
          taskName,
          description,
          priority: 1,
          dueDate: new Date().getTime(),
          projectId,
          labelId: AI_LABEL_ID as Id<"labels">,
          embedding,
        });
      }
    } catch (error) {
      console.error("Error in suggestMissingItemsWithAi:", error);
      // Return null or empty value so that the rest of your app continues to function
      return null;
    }
  },
});


export const suggestMissingSubItemsWithAi = action({
  args: {
    projectId: v.id("projects"),
    parentId: v.id("todos"),
    taskName: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { projectId, parentId, taskName, description }) => {
    try {
      // Retrieve existing sub todos for the parent
      const todos = await ctx.runQuery(api.subTodos.getSubTodosByParentId, {
        parentId,
      });

      // Retrieve project information to include project name in the prompt
      const project = await ctx.runQuery(api.projects.getProjectByProjectId, {
        projectId,
      });
      const projectName = project?.name || "";

      // Call the OpenAI API for missing sub task suggestions
      let response;
      try {
        response = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "I'm a project manager and I need help identifying missing sub tasks for a parent todo. I have a list of existing sub tasks in JSON format, containing objects with 'taskName' and 'description' properties. I also have a good understanding of the project scope. Can you help me identify 2 additional sub tasks that are not yet included in this list? Please provide these missing items in a separate JSON array with the key 'todos' containing objects with 'taskName' and 'description' properties. Ensure there are no duplicates between the existing list and the new suggestions.",
            },
            {
              role: "user",
              content: JSON.stringify({
                todos,
                projectName,
                parentTodo: { taskName, description },
              }),
            },
          ],
          response_format: {
            type: "json_object",
          },
          model: "gpt-3.5-turbo",
        });
      } catch (openAiError) {
        console.error("Error calling OpenAI API:", openAiError);
        return null;
      }

      console.log("OpenAI response:", response.choices[0]);
      const messageContent = response.choices[0].message?.content;
      console.log({ messageContent });

      if (!messageContent) {
        return null;
      }

      let items: Array<{ taskName: string; description: string }>;
      try {
        items = JSON.parse(messageContent)?.todos ?? [];
      } catch (jsonError) {
        console.error("Error parsing OpenAI response JSON:", jsonError);
        return null;
      }

      const AI_LABEL_ID = "k57exc6xrw3ar5e1nmab4vnbjs6v1m4p";

      // Iterate through each suggested item, getting embeddings and creating a sub todo
      for (let i = 0; i < items.length; i++) {
        const { taskName, description } = items[i];
        let embedding: number[] = [];
        try {
          embedding = await getEmbeddingsWithAI(taskName);
        } catch (embedError) {
          console.error("Error getting embedding for task:", taskName, embedError);
          // Continue with an empty embedding if there is an error
        }

        await ctx.runMutation(api.subTodos.createASubTodo, {
          taskName,
          description,
          priority: 1,
          dueDate: new Date().getTime(),
          projectId,
          parentId,
          labelId: AI_LABEL_ID as Id<"labels">,
          embedding,
        });
      }
    } catch (error) {
      console.error("Error in suggestMissingSubItemsWithAi:", error);
      return null;
    }
  },
});


export const getEmbeddingsWithAI = async (searchText: string) => {
  if (!apiKey) {
    console.error("OpenAI API key is not defined");
    return [];
  }

  const req = {
    input: searchText,
    model: "text-embedding-ada-002",
    encoding_format: "float",
  };

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      const msg = await response.text();
      console.error("OpenAI Error:", msg);
      return [];
    }

    const json = await response.json();
    const vector = json["data"][0]["embedding"];
    console.log(`Embedding of ${searchText}: ${vector.length} dimensions`);
    return vector;
  } catch (error) {
    console.error("Error fetching embedding from OpenAI:", error);
    return [];
  }
};

