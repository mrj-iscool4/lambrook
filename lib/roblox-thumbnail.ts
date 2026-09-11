const THUMBNAIL_URL =
  "https://thumbnails.roblox.com/v1/users/avatar-headshot";

type RobloxThumbnailResponse = {
  data?: {
    targetId: number;
    state: string;
    imageUrl?: string;
  }[];
};

export async function getRobloxHeadshot(
  userId: string
): Promise<string | null> {
  if (!userId) {
    return null;
  }

  try {
    const url = new URL(THUMBNAIL_URL);

    url.searchParams.set("userIds", userId);
    url.searchParams.set("size", "150x150");
    url.searchParams.set("format", "Png");
    url.searchParams.set("isCircular", "false");

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 300,
      },
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return null;
    }

    const data =
      (await response.json()) as RobloxThumbnailResponse;

    const thumbnail = data.data?.[0];

    if (
      !thumbnail ||
      thumbnail.state !== "Completed" ||
      !thumbnail.imageUrl
    ) {
      return null;
    }

    return thumbnail.imageUrl;
  } catch {
    return null;
  }
}