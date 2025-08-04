const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");

// Your OpenAI API key here
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Helper: Remove HTML tags from description
function stripHtml(html) {
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}

// Helper: Generate Google search URL for query
function googleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

module.exports = {
  config: {
    name: "characterinfo",
    version: "1.3",
    author: "eran",
    countDown: 5,
    role: 0,
    shortDescription: "Get anime character info by name",
    longDescription:
      "Searches for anime character info using Jikan API, or falls back to ChatGPT summary with Google search link",
    category: "anime",
    guide: "{p}characterinfo [character name]\nExample: {p}characterinfo naruto"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ").trim();

    if (!query) {
      return api.sendMessage(
        "❌ Please provide a character name.\nExample: characterinfo naruto",
        event.threadID,
        event.messageID
      );
    }

    // First try Jikan API
    try {
      const searchUrl = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`;
      const searchRes = await axios.get(searchUrl, { timeout: 7000 });
      const results = searchRes.data?.data;

      if (results && results.length > 0) {
        const character = results[0];
        const { name, images, about, url } = character;

        // Clean and truncate description
        let description = about ? stripHtml(about).trim() : "No description available.";
        if (description.length > 600) {
          description = description.substring(0, 600) + "...";
        }

        let message =
          `🧑‍🎤 Character Info: ${name}\n\n${description}\n\n` +
          `🔗 More info (Jikan): ${url}\n` +
          `🔍 Google Search: ${googleSearchUrl(name)}`;

        const imageUrl = images?.jpg?.image_url || null;

        if (imageUrl) {
          return api.sendMessage(
            {
              body: message,
              attachment: await global.utils.getStreamFromURL(imageUrl)
            },
            event.threadID,
            event.messageID
          );
        } else {
          return api.sendMessage(message, event.threadID, event.messageID);
        }
      }
    } catch (error) {
      console.warn("Jikan API failed or no data, will fallback to ChatGPT:", error.message || error);
    }

    // Fallback: Ask ChatGPT
    if (!OPENAI_API_KEY) {
      return api.sendMessage(
        "❌ Jikan API failed and OpenAI API key is not configured for fallback.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const prompt = `Provide a concise and clear summary about the anime character "${query}". Include key personality traits and role in the story.`;

      const completion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
      });

      const gptResponse = completion.data.choices[0]?.message?.content?.trim();

      if (!gptResponse) {
        return api.sendMessage(
          `❌ Couldn't get info about "${query}" from ChatGPT.`,
          event.threadID,
          event.messageID
        );
      }

      const message = `🤖 ChatGPT info for "${query}":\n\n${gptResponse}\n\n🔍 Google Search: ${googleSearchUrl(query)}`;

      return api.sendMessage(message, event.threadID, event.messageID);

    } catch (gptErr) {
      console.error("ChatGPT fallback error:", gptErr);
      return api.sendMessage(
        "❌ Failed to get character info from ChatGPT. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
