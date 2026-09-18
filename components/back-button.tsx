"use client";

import { useRouter } from "next/navigation";

export function BackButton({
  fallbackHref,
  replace = false,
}: {
  fallbackHref: string;
  replace?: boolean;
}) {
  const router = useRouter();

  function goBack() {
    if (replace) {
      router.replace(fallbackHref);
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="w-fit text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
    >
      Back
    </button>
  );
}
