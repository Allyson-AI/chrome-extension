import { useAuth, useSignIn, useSignUp } from "@clerk/chrome-extension";
import { OAuthStrategy } from "@clerk/types";
import { ComponentPropsWithoutRef, FormEvent, useState } from "react";
import { toast } from "sonner";
import logo from "data-base64:~assets/allyson-a.svg";

// // Add API client utility
const createAccount = async (token: string) => {
  try {
    const response = await fetch(
      `${process.env.PLASMO_PUBLIC_API_URL}/user/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create account");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

export function LoginCard({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  const { userId, getToken } = useAuth();
  const {
    isLoaded: isSignUpLoaded,
    signUp,
    setActive: setSignUpActive,
  } = useSignUp();
  const {
    isLoaded: isSignInLoaded,
    signIn,
    setActive: setSignInActive,
  } = useSignIn();
  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSignUpLoaded || !signUp || !isSignInLoaded || !signIn) return null;
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // First try to create a new account
      try {
        const signUpAttempt = await signUp.create({
          emailAddress: email,
        });

        // Prepare email verification
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setVerifying(true);
        toast.success("Verification code sent to your email!");
      } catch (err: any) {
        // If email exists, try to sign in instead
        if (err.errors?.[0]?.code === "form_identifier_exists") {
          const signInAttempt = await signIn.create({
            identifier: email,
          });

          // Get the emailAddressId from the first factor
          const emailAddressId = signInAttempt.supportedFirstFactors.find(
            (factor) => factor.strategy === "email_code"
          )?.emailAddressId;

          if (!emailAddressId) {
            throw new Error("Email verification not supported");
          }

          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId,
          });
          setVerifying(true);
          toast.success("Verification code sent to your email!");
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      if (err.errors?.[0]) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.error("Error:", JSON.stringify(err, null, 2));
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleVerification(e: FormEvent) {
    e.preventDefault();
    if (!isSignUpLoaded || !signUp || !isSignInLoaded || !signIn) return null;
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      let result;
      let isNewUser = false;

      // Try sign-up verification first
      try {
        result = await signUp.attemptEmailAddressVerification({
          code,
        });
        if (result.status === "complete") {
          await setSignUpActive({ session: result.createdSessionId });
          isNewUser = true;
        }
      } catch (err) {
        // If sign-up verification fails, try sign-in verification
        result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
        if (result.status === "complete") {
          await setSignInActive({ session: result.createdSessionId });
        }
      }

      if (result.status === "complete") {
        try {
          if (isNewUser) {
            const token = await getToken();
            await createAccount(token);
          }
          toast.success("You are signed in!");
          router.push("/");
        } catch (error: any) {
          toast.error("Account setup incomplete. Please contact support.");
          console.error("Account creation error:", error);
          router.push("/");
        }
      }
    } catch (err: any) {
      if (err.errors?.[0]) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
      console.error("Error:", JSON.stringify(err, null, 2));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-w-full plasmo-max-w-md plasmo-bg-black plasmo-border plasmo-border-zinc-800 plasmo-shadow-md plasmo-rounded-lg plasmo-p-6">
      <div className="plasmo-flex plasmo-flex-row plasmo-items-center plasmo-justify-center plasmo-gap-2">
        <img
          src={logo}
          alt="Allyson Logo"
          className="plasmo-w-16 plasmo-h-16"
        />
      </div>

      <div className="plasmo-text-center">
        <h2 className="plasmo-text-xl plasmo-font-bold plasmo-text-zinc-200">
          {verifying ? "Check your email" : "Sign In to Allyson"}
        </h2>
        <p className="plasmo-text-sm plasmo-text-zinc-400">
          {verifying
            ? `We've sent a verification code to ${email}`
            : "Start automating your workflow"}
        </p>
      </div>
      <div className="">
        {verifying ? (
          <form
            onSubmit={handleVerification}
            className="plasmo-flex plasmo-justify-center"
          >
            <div className="plasmo-grid">
              <div className="plasmo-grid plasmo-gap-2 plasmo-mt-4">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`plasmo-border plasmo-border-zinc-800 plasmo-rounded plasmo-p-2 plasmo-w-full plasmo-bg-black plasmo-text-zinc-200`}
                />
              </div>
              <button
                type="submit"
                className="plasmo-mt-4 plasmo-w-full plasmo-bg-black plasmo-border plasmo-border-zinc-800 plasmo-text-zinc-200 plasmo-py-2 plasmo-rounded plasmo-disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="plasmo-flex plasmo-items-center plasmo-justify-center">
                    <span className="plasmo-mr-2">Verifying</span>
                    <svg
                      className="plasmo-animate-spin plasmo-h-4 plasmo-w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="plasmo-opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="plasmo-opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                ) : (
                  "Verify Email"
                )}
              </button>
              <div
                className="plasmo-mt-4 plasmo-text-center plasmo-text-xs plasmo-text-zinc-400 plasmo-cursor-pointer"
                onClick={() => setVerifying(false)}
              >
                Go Back
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="plasmo-grid plasmo-gap-6">
              <div className="plasmo-grid plasmo-gap-2">
                <label
                  htmlFor="email"
                  className="plasmo-text-sm plasmo-font-medium"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@allyson.ai"
                  required
                  disabled={isProcessing}
                  className={`plasmo-border plasmo-border-zinc-800 plasmo-rounded plasmo-p-2 plasmo-w-full plasmo-bg-black plasmo-text-zinc-200`}
                />
              </div>
              <button
                type="submit"
                className="plasmo-w-full plasmo-bg-black plasmo-border plasmo-border-zinc-800 plasmo-text-zinc-200 plasmo-py-2 plasmo-rounded plasmo-disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="plasmo-flex plasmo-items-center plasmo-justify-center">
                    <span className="plasmo-mr-2">Sending Code</span>
                    <svg
                      className="plasmo-animate-spin plasmo-h-4 plasmo-w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="plasmo-opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="plasmo-opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                ) : (
                  "Continue with Email"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      {!verifying && (
        <div className="plasmo-mt-4 plasmo-text-center plasmo-text-xs plasmo-text-zinc-400">
          By clicking continue, you agree to our{" "}
          <a
            href="https://allyson.ai/terms"
            target="_blank"
            className="plasmo-underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://allyson.ai/privacy"
            target="_blank"
            className="plasmo-underline"
          >
            Privacy Policy
          </a>
          .
        </div>
      )}
    </div>
  );
}
