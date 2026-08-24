"use client";

import { useEffect, useState } from "react";

/** True once the component has mounted on the client. Gate localStorage on this. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
