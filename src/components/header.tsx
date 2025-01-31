import { useAuth, UserButton } from "@clerk/chrome-extension";
import { dark } from "@clerk/themes";
import { IconBrowser, IconChevronRight, IconMenu2 } from "@tabler/icons-react";
import { useCallback, useEffect, useReducer, useState } from "react";
import { toast } from "sonner";

export const Header = ({
  page,
  setPage,
  showMenu,
  setShowMenu,
}: {
  page: string;
  setPage: (page: string) => void;
  showMenu: boolean;
  setShowMenu: (showMenu: boolean) => void;
}) => {
  const [count, increase] = useReducer((c) => c + 1, 0);
  const { userId, getToken } = useAuth();
  const [user, setUser] = useState<any>(null);

  async function fetchLatestUserData() {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.PLASMO_PUBLIC_API_URL}/v1/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch latest user data");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error: unknown) {
      console.error("Error fetching latest user data:", error);
      toast.error("Error fetching user. Please try again.");
      throw error;
    }
  }

  useEffect(() => {
    fetchLatestUserData();
  }, []);
  return (
    <div className="plasmo-p-4 plasmo-flex plasmo-items-center plasmo-justify-between ">
      <button
        className=" plasmo-text-zinc-200"
        onClick={() => setShowMenu(!showMenu)}
      >
        <IconMenu2 className="plasmo-text-zinc-200" />
      </button>
      {showMenu && (
        <div className="plasmo-flex plasmo-bg-black plasmo-flex-col plasmo-border plasmo-border-zinc-800 plasmo-rounded-lg plasmo-p-2 plasmo-absolute plasmo-top-12 plasmo-left-4 plasmo-z-10">
          <div
            onClick={() => {
              setPage("new-session");
              setShowMenu(false);
            }}
            className="plasmo-flex plasmo-flex-row plasmo-items-center plasmo-justify-between plasmo-cursor-pointer plasmo-p-2 plasmo-border-b plasmo-border-zinc-800"
          >
            <p className="plasmo-text-zinc-200 plasmo-text-md plasmo-font-semibold">
              New Session
            </p>
          </div>
          <div
            onClick={() => {
              setPage("sessions");
              setShowMenu(false);
            }}
            className="plasmo-flex plasmo-flex-row plasmo-items-center plasmo-justify-between plasmo-cursor-pointer plasmo-p-2 plasmo-border-b plasmo-border-zinc-800"
          >
            <p className="plasmo-text-zinc-200 plasmo-text-md plasmo-font-semibold">
              Sessions
            </p>
          </div>
          <div
            onClick={() => {
              setPage("save-cookies");
              setShowMenu(false);
            }}
            className="plasmo-flex plasmo-flex-row plasmo-items-center plasmo-justify-between plasmo-cursor-pointer plasmo-p-2 "
          >
            <p className="plasmo-text-zinc-200 plasmo-text-md plasmo-font-semibold">
              Authenticate Website
            </p>
          </div>
        </div>
      )}
      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2">
        <a
          href={`${process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST}/settings`}
          target="_blank"
          className="plasmo-text-zinc-200 plasmo-text-md"
        >
          $
          {user?.balance?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"}
        </a>
        <UserButton appearance={{ baseTheme: dark }} />
      </div>
    </div>
  );
};
