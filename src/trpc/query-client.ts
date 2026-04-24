import { QueryClient } from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: () => true
      },
      hydrate: {
        deserializeData: superjson.deserialize
      }
    }
  });
}
