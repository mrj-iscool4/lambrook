import Image from "next/image";
import { User } from "lucide-react";
import { getRobloxHeadshot } from "@/lib/roblox-thumbnail";

export default async function RobloxAvatar({
  userId,
  size = 40,
  className = "",
}: {
  userId: string;
  size?: number;
  className?: string;
}) {
  const imageUrl = await getRobloxHeadshot(userId);

  if (!imageUrl) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/[0.06] bg-[#f7f7f8] ${className}`}
        style={{
          width: size,
          height: size,
        }}
      >
        <User
          size={Math.max(15, Math.round(size * 0.42))}
          className="text-[#969aa1]"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border border-black/[0.06] bg-[#f7f7f8] ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <Image
        src={imageUrl}
        alt=""
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </div>
  );
}