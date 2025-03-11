import { useAuth } from "@clerk/chrome-extension";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export const SaveCookies = () => {
  const { getToken } = useAuth();

  const [url, setUrl] = useState<string | null>(null);
  const [cookies, setCookies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cookiesExist, setCookiesExist] = useState(false);

  function getURL() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]?.url) {
        return;
      }
      const url = new URL(tabs[0].url);
      setUrl(url.hostname);
      const token = await getToken();
      const response = await fetch(
        `${process.env.PLASMO_PUBLIC_API_URL}/v1/cookies/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: url.hostname,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.data === null) {
        setCookiesExist(false);
      } else {
        setCookiesExist(true);
      }
    });
  }

  useEffect(() => {
    getURL();
  }, []);

  async function handleSaveCookies() {
    setLoading(true);

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.url) {
          return;
        }

        const url = new URL(tabs[0].url);
        setUrl(url.hostname);

        chrome.cookies.getAll({ domain: url.hostname }, async (cookies) => {
          if (chrome.runtime.lastError) {
            console.error("Error getting cookies:", chrome.runtime.lastError);
            return;
          }
          console.log(cookies);
          const token = await getToken();
          const response = await fetch(
            `${process.env.PLASMO_PUBLIC_API_URL}/v1/cookies/save`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                url: url.hostname,
                cookies: cookies,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          getURL();

          toast.success("Website saved successfully");
        });
      });
    } catch (error) {
      console.error("Error getting cookies:", error);
      toast.error("Error getting cookies. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateCookies() {
    setLoading(true);
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.url) {
          return;
        }

        const url = new URL(tabs[0].url);
        setUrl(url.hostname);

        chrome.cookies.getAll({ domain: url.hostname }, async (cookies) => {
          if (chrome.runtime.lastError) {
            console.error("Error getting cookies:", chrome.runtime.lastError);
            return;
          }

          const token = await getToken();
          const response = await fetch(
            `${process.env.PLASMO_PUBLIC_API_URL}/v1/cookies/update`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                url: url.hostname,
                cookies: cookies,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          getURL();

          toast.success("Website updated successfully");
        });
      });
    } catch (error) {
      console.error("Error getting cookies:", error);
      toast.error("Error getting cookies. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnectWebsite() {
    const token = await getToken();
    const response = await fetch(
      `${process.env.PLASMO_PUBLIC_API_URL}/v1/cookies/delete`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: url,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
      toast.error("Error disconnecting website. Please try again.");
    }

    const data = await response.json();
    getURL();
    toast.success("Website disconnected successfully");
  }

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-gap-4 plasmo-w-full plasmo-h-full">
      {url && (
        <p className="plasmo-text-zinc-200 plasmo-text-md plasmo-text-left plasmo-font-medium">
          URL: {url}
        </p>
      )}
      <button
        onClick={cookiesExist ? handleUpdateCookies : handleSaveCookies}
        disabled={loading}
        className=" plasmo-p-2 plasmo-bg-black plasmo-border plasmo-border-zinc-800 plasmo-text-zinc-200 plasmo-rounded-lg plasmo-font-medium"
      >
        {cookiesExist ? "Re-authenticate Website" : "Authenticate Website"}
      </button>
      {cookiesExist && (
        <button
          onClick={handleDisconnectWebsite}
          disabled={loading}
          className=" plasmo-p-2 plasmo-bg-red-700/20 plasmo-border plasmo-border-red-800/50 plasmo-text-red-700 plasmo-rounded-lg plasmo-font-medium plasmo-disabled:plasmo-opacity-50"
        >
          Disconnect Website
        </button>
      )}
      <div className="plasmo-p-4 plasmo-bg-sky-700/20 plasmo-border plasmo-border-sky-800/50 plasmo-rounded-lg plasmo-flex plasmo-flex-row plasmo-items-center plasmo-justify-between">
        <p className="plasmo-text-sky-700 plasmo-text-md plasmo-text-center plasmo-font-medium">
          We encrypt & store your cookies so they can be used within Allyson
          easily so you don't have to log back in every single time.
        </p>
      </div>
      
    </div>
  );
};
