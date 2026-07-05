"use client";
import { SWRConfig } from "swr";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{
      errorRetryCount: 3,
      shouldRetryOnError: (error: any) => {
        const status = error?.response?.status;
        return !status || status >= 500;
      },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }}>
      {children}
    </SWRConfig>
  );
}
