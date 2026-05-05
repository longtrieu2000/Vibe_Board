const basePrompts = [
  {
    emoji: "📝",
    text: "Summarize this",
    prompt: "Summarize this in 2-3 sentences",
  },
  {
    emoji: "🎣",
    text: "Give me 5 hooks",
    prompt: "Give me 5 attention-grabbing hooks",
  },
  {
    emoji: "🎬",
    text: "Write a 30s script",
    prompt: "Write a compelling 30 second script",
  },
  {
    emoji: "🖼️",
    text: "Thumbnail title ideas",
    prompt: "Generate 5 catchy thumbnail title ideas",
  },
  {
    emoji: "📊",
    text: "Analyze viral potential",
    prompt:
      "Analyze the viral potential. What makes it work? Rate it 1-10 and explain.",
  },
  {
    emoji: "🎯",
    text: "Target audience",
    prompt: "What audience would this appeal to most and why?",
  },
  {
    emoji: "#️⃣",
    text: "Generate hashtags",
    prompt: "Generate 10 SEO-optimized hashtags",
  },
  {
    emoji: "📱",
    text: "Platform captions",
    prompt: "Write 3 descriptions optimized for YouTube, TikTok, Instagram",
  },
  {
    emoji: "💡",
    text: "Suggest improvements",
    prompt: "What improvements could make this more viral?",
  },
  {
    emoji: "🗓️",
    text: "Posting schedule",
    prompt: "Create a 2-week posting schedule: titles + short descriptions",
  },
  {
    emoji: "🔤",
    text: "Title variants",
    prompt: "Give me 10 strong title variants across different tones",
  },
  {
    emoji: "🎯",
    text: "CTAs",
    prompt: "Write 6 call-to-action options geared for engagement",
  },
  {
    emoji: "🧠",
    text: "Vibe analysis",
    prompt: "Describe the vibe and tone. What emotions does it evoke?",
  },
];

const collectionPrompts = [
  {
    emoji: "🧩",
    text: "Compare 4 clips",
    prompt: "Compare each Clip 1..4 and pick the strongest. Explain why.",
  },
  {
    emoji: "🏆",
    text: "Pick a winner",
    prompt: "Pick the best performing clip among 1..4 and explain tradeoffs.",
  },
  {
    emoji: "🪝",
    text: "5 hooks per clip",
    prompt: "For each Clip 1..4, generate 5 hooks. Keep per-clip sections.",
  },
  {
    emoji: "🧱",
    text: "60s mashup script",
    prompt:
      "Create a 60 second script that combines the strongest parts of Clips 1..4.",
  },
  {
    emoji: "📝",
    text: "Structured breakdown",
    prompt:
      "Provide a structured breakdown for Clip 1..4: summary + 3 hook ideas each.",
  },
];

export function AIPromptButtons({ selectedCard, onSendPrompt, aiLoading }) {
  const isCollection = selectedCard?.card_type === "collection";
  const prompts = isCollection
    ? [...collectionPrompts, ...basePrompts]
    : basePrompts;

  return (
    <div className="p-4 space-y-2 border-b border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto">
      {prompts.map((item, index) => (
        <button
          key={index}
          onClick={() => onSendPrompt(item.prompt)}
          disabled={aiLoading}
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-left"
        >
          {item.emoji} {item.text}
        </button>
      ))}
    </div>
  );
}
