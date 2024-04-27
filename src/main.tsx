import * as React from "react";
import { createRoot } from "react-dom/client";
import { MapApplication } from "./components/app/MapApplication";

const root = createRoot(document.getElementById("root")!);

root.render(<MapApplication />);
