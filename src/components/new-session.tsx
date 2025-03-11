import { useAuth } from "@clerk/chrome-extension";
import { IconArrowUp } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export const NewSession = () => {
  const { getToken } = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(
        `${process.env.PLASMO_PUBLIC_API_URL}/v1/sessions/new`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            task: message,
            sessionVariables: {},
            sessionDetails: "",
            maxSteps: 100,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      toast.success("Session created successfully");
      chrome.tabs.create({
        url: `${process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST}/sessions/session?id=${data.sessionId}`,
      });
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Error creating session. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-h-[515px] plasmo-justify-end plasmo-bg-black">
      <div className="plasmo-flex plasmo-flex-col plasmo-gap-2 plasmo-items-center plasmo-justify-center plasmo-h-full">
        <h1 className="plasmo-text-zinc-200 plasmo-text-xl plasmo-text-center plasmo-font-semibold">
          Ask me to start a task for you.
        </h1>
      </div>
      <div className="plasmo-relative plasmo-w-full">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          placeholder=""
          className={`plasmo-border plasmo-outline-none plasmo-border-zinc-800 plasmo-rounded plasmo-p-2 plasmo-w-full plasmo-bg-black plasmo-text-zinc-200 plasmo-min-h-[100px] plasmo-resize-none`}
        />
        <button
          disabled={loading}
          onClick={handleSend}
          className="plasmo-absolute plasmo-right-2 plasmo-mb-1 plasmo-bottom-[10px] plasmo-bg-black plasmo-border plasmo-border-zinc-800 plasmo-text-white plasmo-rounded-lg plasmo-px-3 plasmo-py-1 plasmo-flex plasmo-items-center plasmo-gap-1 hover:plasmo-bg-zinc-900 transition-colors"
        >
          <IconArrowUp className="plasmo-text-zinc-400 plasmo-w-4 plasmo-h-4" />
          <span className="plasmo-text-zinc-200 plasmo-text-sm plasmo-font-medium">
            Send
          </span>
        </button>
      </div>
    </div>
  );
};
