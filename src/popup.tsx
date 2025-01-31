import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  useAuth,
  UserButton,
} from "@clerk/chrome-extension";
import { dark } from "@clerk/themes";
import { IconMenu2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { Header } from "~components/header";
import { LoginCard } from "~components/login";
import { NewSession } from "~components/new-session";
import { SaveCookies } from "~components/save-cookies";
import { Sessions } from "~components/sessions";
import "~style.css";

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const EXTENSION_URL = chrome.runtime.getURL(".");
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST;

if (!PUBLISHABLE_KEY || !SYNC_HOST) {
  throw new Error(
    "Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY and PLASMO_PUBLIC_CLERK_SYNC_HOST to the .env.development file"
  );
}

function IndexPopup() {
  const [showMenu, setShowMenu] = useState(false);
  const [page, setPage] = useState("sessions");
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl={`${EXTENSION_URL}/popup.html`}
      signInFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
      signUpFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
      syncHost={SYNC_HOST}
    >
      <div className="plasmo-h-[600px] plasmo-w-[400px] plasmo-bg-black">
        <SignedIn>
          <header className="plasmo-w-full plasmo-bg-black plasmo-z-10 plasmo-border-b plasmo-border-zinc-800">
            <Header
              setPage={setPage}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              page={page}
            />
          </header>
          <main className="plasmo-flex plasmo-flex-col plasmo-grow plasmo-w-full plasmo-p-4 plasmo-bg-black">
            {page === "sessions" && <Sessions />}
            {page === "save-cookies" && <SaveCookies />}
            {page === "new-session" && <NewSession />}
          </main>
        </SignedIn>
        <SignedOut>
          <main className="plasmo-grow plasmo-flex plasmo-items-center plasmo-justify-center plasmo-p-4 plasmo-h-full">
            <LoginCard />
          </main>
        </SignedOut>
      </div>
      <Toaster
        toastOptions={{
          style: {
            background: "black",
            color: "#e2e8f0",
            border: "1px solid #27272a",
          }
        }}
      />
    </ClerkProvider>
  );
}

export default IndexPopup;
