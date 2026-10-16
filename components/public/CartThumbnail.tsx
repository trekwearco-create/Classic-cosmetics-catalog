"use client";

import Image from "next/image";
import { useState } from "react";

export default function CartThumbnail({
  photoUrl,
  alt = "",
}: {
  photoUrl: string | null;
  alt?: string;
}) {
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);

  return (
    <span className="cart-thumbnail" aria-hidden={alt === ""}>
      {photoUrl && photoUrl !== failedPhotoUrl ? (
        <Image
          src={photoUrl}
          alt={alt}
          fill
          unoptimized
          sizes="96px"
          className="object-contain p-[6px]"
          onError={() => setFailedPhotoUrl(photoUrl)}
        />
      ) : (
        <svg
          viewBox="0 0 32 32"
          width="30"
          height="30"
          fill="none"
          stroke="var(--bronze)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <rect x="5" y="6" width="22" height="20" rx="3" />
          <circle cx="12" cy="13" r="2.2" />
          <path d="m7 23 6-6 4 4 3-3 5 5" />
        </svg>
      )}
    </span>
  );
}
