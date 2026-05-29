import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        30_000,  // data stays fresh for 30s — no re-fetch on tab switch
      retry:            1,       // retry once on failure before showing error
      refetchOnWindowFocus: false, // don't re-fetch just because user switched browser tabs
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
     </QueryClientProvider>
  </React.StrictMode>
);
