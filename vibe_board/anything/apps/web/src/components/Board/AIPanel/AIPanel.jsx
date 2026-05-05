import { Sparkles } from "lucide-react";
import { AIPromptButtons } from "./AIPromptButtons";
import { AIMessageList } from "./AIMessageList";

export function AIPanel({
  selectedCard,
  aiMessages,
  streamingMessage,
  aiLoading,
  onSendPrompt,
  onSaveAsNote,
}) {
  if (!selectedCard) return null;

  const saveLabel =
    selectedCard.card_type === "collection"
      ? "Save breakdown as note on board"
      : "Save as note on board";

  // Mini quick actions for one-click follow-ups inside the panel
  const quickActions = [
    {
      key: "summarize_pdfs",
      emoji: "📄",
      label: "Summarize linked PDFs",
      prompt:
        "Batch summarize all linked PDFs only. For each PDF, output: Name, URL, 5-sentence summary, 5 key takeaways, 3 action items. If the PDF text is not available, infer based on the filename and provide questions to clarify.",
    },
    {
      key: "titles_per_video",
      emoji: "🎥",
      label: "10 titles/video",
      prompt:
        "For each linked video only, generate 10 high-performing title ideas. Use varied angles (curiosity, listicle, problem/solution, contrarian, emotional). Output as: Video Title → 10 Ideas.",
    },
    {
      key: "weekly_plan",
      emoji: "📅",
      label: "Weekly plan",
      prompt:
        "Create a weekly content plan using the linked items. Return a 7-day table with: Day, Platform, Post format, Hook, Caption, CTA, and Hashtags. Balance platforms based on the content type.",
    },
    {
      key: "cross_post_plan",
      emoji: "🔁",
      label: "Cross-post plan",
      prompt:
        "Create a cross-post plan for YouTube Shorts, TikTok, and Instagram Reels using the linked items. For each item, list: platform-specific hook, opening 3 seconds, caption style, hashtags, and any edits needed (cuts, aspect ratio, overlays).",
    },
  ];

  return (
    <div className="w-80 bg-white dark:bg-[#121212] border-l border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 font-jetbrains-mono flex items-center space-x-2">
          <Sparkles size={20} className="text-orange-500" />
          <span>AI Assistant</span>
        </h2>
      </div>

      {/* Mini follow-up actions inside the AI panel */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-jetbrains-mono">
          Quick actions
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((qa) => (
            <button
              key={qa.key}
              onClick={() => onSendPrompt(qa.prompt)}
              disabled={aiLoading}
              className="px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-jetbrains-mono"
            >
              <span className="mr-1">{qa.emoji}</span>
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      <AIPromptButtons
        selectedCard={selectedCard}
        onSendPrompt={onSendPrompt}
        aiLoading={aiLoading}
      />

      <AIMessageList
        aiMessages={aiMessages}
        streamingMessage={streamingMessage}
        aiLoading={aiLoading}
        onSaveAsNote={onSaveAsNote}
        saveLabel={saveLabel}
      />
    </div>
  );
}
