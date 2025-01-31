import { useAuth, UserButton } from "@clerk/chrome-extension";
import { dark } from "@clerk/themes";
import { IconMenu2, IconLoader } from "@tabler/icons-react";
import { useCallback, useEffect, useReducer, useState } from "react";

export const Sessions = () => {
  const { userId, getToken } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const status = statusFilter === "all" ? "" : statusFilter;

      const response = await fetch(
        `${process.env.PLASMO_PUBLIC_API_URL}/v1/sessions?page=${currentPage}&limit=${itemsPerPage}&status=${status}&source=client`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch latest user data");

      const data = await response.json();
      setSessions(prev => [...prev, ...data.sessions]);
      setHasMore(data.sessions.length >= itemsPerPage);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, statusFilter, getToken]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    setCurrentPage(1);
    setSessions([]);
    setHasMore(true);
  }, [statusFilter, itemsPerPage]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const bottomThreshold = 100;
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) <= bottomThreshold;
    
    if (isAtBottom && !loading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  return (
    <div 
      className="plasmo-flex plasmo-flex-col plasmo-gap-4 plasmo-w-full plasmo-h-[500px] plasmo-overflow-y-auto"
      onScroll={handleScroll}
    >
      {sessions.map((session) => (
        <div
          key={session.sessionId}
          onClick={() => {
            chrome.tabs.create({ 
              url: `${process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST}/sessions/session?id=${session.sessionId}` 
            });
          }}
          className="plasmo-cursor-pointer plasmo-flex plasmo-flex-col plasmo-h-full plasmo-border plasmo-border-zinc-800 plasmo-rounded-lg plasmo-shadow-md plasmo-p-4 plasmo-w-full"
        >
          <div className="plasmo-flex-grow plasmo-cursor-pointer">
            <h3 className="plasmo-text-lg plasmo-text-zinc-200 plasmo-font-semibold plasmo-mb-2 plasmo-truncate">
              {session.name}
            </h3>
            {/* <p className="plasmo-text-sm plasmo-text-zinc-500">{session.lastActionPreview}</p> */}
          </div>
          <div className="plasmo-my-2 plasmo-mx-1 plasmo-bg-zinc-800 plasmo-h-[1px]" />
          <div className="plasmo-flex plasmo-justify-between plasmo-items-center">
            <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-pl-1">
              <div
                className={`plasmo-w-2 plasmo-h-2 plasmo-rounded-full ${
                  session.status === "active"
                    ? "plasmo-bg-green-500"
                    : session.status === "humanInput"
                      ? "plasmo-bg-yellow-500"
                      : session.status === "completed"
                        ? "plasmo-bg-blue-500"
                        : "plasmo-bg-red-500"
                }`}
              />
              <span className="plasmo-text-xs plasmo-text-zinc-400">
                {session.status === "active"
                  ? "Active"
                  : session.status === "humanInput"
                    ? "Help Needed"
                    : session.status === "completed"
                      ? "Completed"
                      : session.status === "stopped"
                        ? "Stopped"
                        : "Inactive"}
              </span>
              <span className="plasmo-text-xs plasmo-text-zinc-400">-</span>
              <span className="plasmo-text-xs plasmo-text-zinc-400">
                $
                {session?.cost
                  ? session.cost.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="plasmo-flex plasmo-justify-center plasmo-items-center plasmo-mt-4">
          <IconLoader className="plasmo-animate-spin plasmo-text-zinc-400" />
        </div>
      )}

      {!hasMore && (
        <div className="plasmo-text-center plasmo-text-zinc-500 plasmo-text-sm plasmo-p-4">
          No more sessions to load
        </div>
      )}
    </div>
  );
};
