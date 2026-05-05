import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const cards = await sql`
      SELECT * FROM cards 
      WHERE board_id = ${id}
      ORDER BY created_at ASC
    `;

    return Response.json({ cards });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return Response.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      type,
      videoUrl,
      text,
      imageUrl,
      imageCaption,
      x,
      y,
      color,
      size,
      pdfUrl,
      pdfName,
      textContent,
      textColor,
    } = body;

    if (
      !type ||
      !["video", "note", "image", "pdf", "text", "collection"].includes(type)
    ) {
      return Response.json({ error: "Invalid card type" }, { status: 400 });
    }

    let card;

    if (type === "video") {
      if (!videoUrl) {
        return Response.json(
          { error: "Video URL is required" },
          { status: 400 },
        );
      }

      // Extract video metadata
      const metadata = await extractVideoMetadata(videoUrl);

      [card] = await sql`
        INSERT INTO cards (
          board_id, card_type, x, y, 
          video_url, platform, thumbnail_url, video_title
        )
        VALUES (
          ${id}, 'video', ${x || 0}, ${y || 0},
          ${videoUrl}, ${metadata.platform}, ${metadata.thumbnail}, ${metadata.title}
        )
        RETURNING *
      `;
    } else if (type === "image") {
      if (!imageUrl) {
        return Response.json(
          { error: "Image URL is required" },
          { status: 400 },
        );
      }

      [card] = await sql`
        INSERT INTO cards (
          board_id, card_type, x, y, width, height,
          image_url, image_caption
        )
        VALUES (
          ${id}, 'image', ${x || 0}, ${y || 0}, 320, 240,
          ${imageUrl}, ${imageCaption || ""}
        )
        RETURNING *
      `;
    } else if (type === "pdf") {
      if (!pdfUrl) {
        return Response.json({ error: "PDF URL is required" }, { status: 400 });
      }

      [card] = await sql`
        INSERT INTO cards (
          board_id, card_type, x, y, width, height,
          pdf_url, pdf_name
        )
        VALUES (
          ${id}, 'pdf', ${x || 0}, ${y || 0}, 300, 200,
          ${pdfUrl}, ${pdfName || "Document.pdf"}
        )
        RETURNING *
      `;
    } else if (type === "text") {
      [card] = await sql`
        INSERT INTO cards (
          board_id, card_type, x, y, width, height,
          text_content, text_color, text_size
        )
        VALUES (
          ${id}, 'text', ${x || 0}, ${y || 0}, 200, 60,
          ${textContent || "Text"}, ${textColor || "#000000"}, ${size || "medium"}
        )
        RETURNING *
      `;
    } else if (type === "collection") {
      [card] = await sql`
        INSERT INTO cards (
          board_id, card_type, x, y, width, height,
          slot1_card_id, slot2_card_id, slot3_card_id, slot4_card_id
        )
        VALUES (
          ${id}, 'collection', ${x || 0}, ${y || 0}, 560, 420,
          NULL, NULL, NULL, NULL
        )
        RETURNING *
      `;
    } else {
      [card] = await sql`
        INSERT INTO cards (
          board_id, card_type, x, y, note_text, width, height, note_color, text_size
        )
        VALUES (
          ${id}, 'note', ${x || 0}, ${y || 0}, ${text || ""}, 250, 150, 
          ${color || "yellow"}, ${size || "medium"}
        )
        RETURNING *
      `;
    }

    // Update board's updated_at timestamp
    await sql`
      UPDATE boards 
      SET updated_at = NOW() 
      WHERE id = ${id}
    `;

    return Response.json({ card });
  } catch (error) {
    console.error("Error creating card:", error);
    return Response.json({ error: "Failed to create card" }, { status: 500 });
  }
}

async function extractVideoMetadata(url) {
  const metadata = {
    platform: "Unknown",
    thumbnail: null,
    title: "Video",
  };

  try {
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      metadata.platform = "YouTube";

      // Extract video ID
      let videoId = null;
      if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
      } else if (url.includes("youtube.com/shorts/")) {
        videoId = url.split("shorts/")[1]?.split("?")[0];
      }

      if (videoId) {
        metadata.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        // Try to fetch video title from oEmbed
        try {
          const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
          const response = await fetch(oembedUrl);
          if (response.ok) {
            const data = await response.json();
            metadata.title = data.title || "YouTube Video";
          }
        } catch (e) {
          metadata.title = "YouTube Video";
        }
      }
    }
    // TikTok
    else if (url.includes("tiktok.com")) {
      metadata.platform = "TikTok";
      try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
          const data = await response.json();
          metadata.title = data.title || "TikTok Video";
          metadata.thumbnail = data.thumbnail_url || null;
        } else {
          metadata.title = "TikTok Video";
        }
      } catch (e) {
        metadata.title = "TikTok Video";
      }
    }
    // Instagram
    else if (url.includes("instagram.com")) {
      metadata.platform = "Instagram";
      metadata.title = "Instagram Video";
    }
    // Vimeo
    else if (url.includes("vimeo.com")) {
      metadata.platform = "Vimeo";
      try {
        const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
          const data = await response.json();
          metadata.title = data.title || "Vimeo Video";
          metadata.thumbnail = data.thumbnail_url || null;
        } else {
          metadata.title = "Vimeo Video";
        }
      } catch (e) {
        metadata.title = "Vimeo Video";
      }
    }
    // Twitter/X
    else if (url.includes("twitter.com") || url.includes("x.com")) {
      metadata.platform = "Twitter";
      metadata.title = "Twitter Video";
    }
    // Facebook
    else if (url.includes("facebook.com") || url.includes("fb.watch")) {
      metadata.platform = "Facebook";
      metadata.title = "Facebook Video";
    }
  } catch (error) {
    console.error("Error extracting video metadata:", error);
  }

  return metadata;
}
