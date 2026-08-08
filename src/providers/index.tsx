"use client";

import { useSyncExternalStore } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/providers/theme-provider";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

const emptySubscribe = () => () => {};

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {mounted ? children : <div className="min-h-screen bg-[#0a0a0f]" />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
