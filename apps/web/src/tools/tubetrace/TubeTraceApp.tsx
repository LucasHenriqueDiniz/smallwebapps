import { useEffect } from "react";
import NativeTubeTraceApp from "@/tools/tubetrace/native/App";

export default function TubeTraceApp() {
  useEffect(() => {
    const cssId = "tubetrace-embed-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "/tubetrace-app/embed.css";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[#09090b] shadow-soft">
      <NativeTubeTraceApp />
    </div>
  );
}
