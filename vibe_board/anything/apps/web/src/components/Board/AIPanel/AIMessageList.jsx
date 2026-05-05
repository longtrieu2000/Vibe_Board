export function AIMessageList({
  aiMessages,
  streamingMessage,
  aiLoading,
  onSaveAsNote,
  saveLabel = "Save as note on board",
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {aiMessages.map((msg, idx) => (
        <div key={idx}>
          <div className={`${msg.role === "user" ? "flex justify-end" : ""}`}>
            <div
              className={`${
                msg.role === "user"
                  ? "bg-blue-100 dark:bg-blue-900 max-w-[80%]"
                  : "bg-gray-100 dark:bg-gray-800"
              } rounded-lg p-3`}
            >
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-jetbrains-mono">
                {msg.content}
              </p>
            </div>
          </div>
          {msg.role === "assistant" && (
            <button
              onClick={() => onSaveAsNote(msg.content)}
              className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
            >
              {saveLabel}
            </button>
          )}
        </div>
      ))}

      {streamingMessage && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-jetbrains-mono">
            {streamingMessage}
          </p>
        </div>
      )}

      {aiLoading && !streamingMessage && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-jetbrains-mono">
            Thinking...
          </p>
        </div>
      )}
    </div>
  );
}
