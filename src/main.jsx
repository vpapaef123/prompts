import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import FileMarkdownConverter from "./FileMarkdownConverter";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FileMarkdownConverter />
  </StrictMode>
);
