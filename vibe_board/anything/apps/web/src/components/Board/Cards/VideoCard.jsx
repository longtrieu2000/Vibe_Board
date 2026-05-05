import { useState } from "react";
import { Video, Play, X } from "lucide-react";

function getEmbedUrl(url) {
  if (!url) return null;

  // YouTube
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  // Vimeo
  if (url.includes("vimeo.com")) {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }

  // TikTok (note: TikTok embedding is limited)
  if (url.includes("tiktok.com")) {
    return url; // TikTok requires special handling
  }

  return null;
}

export function VideoCard({ card }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = getEmbedUrl(card.video_url);
  const canPlay = !!embedUrl && !card.video_url?.includes("tiktok");

  const handlePlayClick = (e) => {
    e.stopPropagation();
    setIsPlaying(true);
  };

  const handleStopClick = (e) => {
    e.stopPropagation();
    setIsPlaying(false);
  };

  return (
    <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg overflow-hidden h-full">
      {isPlaying && embedUrl ? (
        <div className="relative w-full h-full min-h-[200px]">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <button
            onClick={handleStopClick}
            className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-all z-10"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            {card.thumbnail_url ? (
              <img
                src={card.thumbnail_url}
                alt={card.video_title}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Video className="text-gray-400" size={32} />
              </div>
            )}

            {/* Play button overlay */}
            {canPlay && (
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all group"
              >
                <div className="bg-orange-500 rounded-full p-4 group-hover:scale-110 transition-transform">
                  <Play size={24} fill="white" className="text-white ml-0.5" />
                </div>
              </button>
            )}
          </div>

          <div className="p-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 font-jetbrains-mono">
              {card.video_title || "Video"}
            </p>
            {card.platform && (
              <span className="inline-block mt-2 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded">
                {card.platform}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
