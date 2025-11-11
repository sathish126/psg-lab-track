import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeDemoNotifications } from './lib/initNotifications';

// Initialize demo notifications
initializeDemoNotifications();

createRoot(document.getElementById("root")!).render(<App />);
