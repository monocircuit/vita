/**
 * This will be the component for the homepage Navbar. Not to be confused by the
 * Toolbar that will be used in the timeline editor.
 *
 * @format
 */

"use client";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@monocircuit/monolithium/components";
import { LayoutDashboard, FileText, LogOut } from "lucide-react";

import profilePic from "@/assets/images/profilepic.jpg";
import SignInGraphic from "@/assets/images/svg/login2.svg";
import SignUpGraphic from "@/assets/images/svg/signup2.svg";
import MonocircuitLogo from "../../../../public/static/icons/monocircuit.svg";

import useOnScrollbarVisible from "@/hooks/useOnScrollbarVisible";
import SignIn from "@/components/SignIn";
import SignUp from "@/components/SignUp";
import { createClient } from "@/shared/data/client";
import ThemeToggle from "@/components/ThemeToggle";
import { AUTH_MODAL_EVENT, AuthMode } from "@/shared/auth-modal";
import { PulsatingDot } from "@monocircuit/monolithium/components";

const dashboardSectionFromPath = (pathname: string) => {
  if (pathname.startsWith("/dashboard/vitas")) return "vitas";
  if (pathname.startsWith("/dashboard/chronicles")) return "chronicles";
  return "overview";
};

const Navbar: FunctionComponent = () => {
  /** ANCHOR: References */
  const signInButton = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  /** ANCHOR: State */
  const [activeModal, setActiveModal] = useState<"signin" | "signup" | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null); // null = unknown
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setIsSignedIn(!!session?.user);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsSignedIn(!!session?.user);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const mode = (e as CustomEvent<AuthMode>).detail;
      if (mode === "signin" || mode === "signup") setActiveModal(mode);
    };
    window.addEventListener(AUTH_MODAL_EVENT, handler);
    return () => window.removeEventListener(AUTH_MODAL_EVENT, handler);
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;
  const dashboardSection = dashboardSectionFromPath(pathname ?? "");

  useEffect(() => {
    setActiveModal(null);
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountMenuOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsSignedIn(false);
    setAccountMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  useOnScrollbarVisible(() => {
    console.log("scrollbar visible");
  }, []);

  return (
    <>
      <div className="flex w-full h-full border-b border-secondary relative z-50">
        <Button
          className="flex overflow-hidden h-full aspect-square [&_svg]:text-secondary"
          classNameDrop="!bg-[var(--primary-color)] opacity-30"
          onClick={() => router.push("/")}
          onlyClickAnimation
          vibrate
        >
          <MonocircuitLogo />
        </Button>
        <div className="bg-secondary w-px" />

        {isSignedIn && (
          <div className="flex items-center h-full">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="nav-bracket-link relative flex items-center gap-2 px-5 h-full text-xs font-medium uppercase tracking-wider text-secondary"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              dashboard
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/vitas")}
              className="nav-bracket-link relative flex items-center gap-2 px-5 h-full text-xs font-medium uppercase tracking-wider text-secondary"
            >
              <FileText className="h-3.5 w-3.5" />
              my vitas
            </button>
          </div>
        )}

        {isDashboard && isSignedIn ? (
          <>
            <div
              className="flex items-center px-5 text-secondary"
              style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 11,
                letterSpacing: "0.08em",
                opacity: 0.7,
              }}
            >
              dashboard /
              <span style={{ marginLeft: 6, opacity: 1 }}>
                {dashboardSection}
              </span>
            </div>
            <div className="flex-1" />
            <div
              className="flex items-center gap-2 px-4 text-secondary"
              style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 10,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              <PulsatingDot />
              <span>Synced</span>
            </div>
            <div className="bg-secondary w-px" />
            <button
              onClick={() => router.push("/dashboard/vitas")}
              className="flex items-center px-5 transition-colors"
              style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                background: "var(--color-accent)",
                color: "#0a0a0a",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#ffdd2e")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--color-accent)")}
            >
              + New Vita
            </button>
            <div className="bg-secondary w-px" />
          </>
        ) : (
          <div className="grid grid-cols-[100%] grid-rows-[100%] place-items-center flex-1" />
        )}
        <div className="h-full flex items-center justify-center px-4">
          <ThemeToggle />
        </div>
        <div className="bg-secondary w-px" />

        {/**
         * Part of the Navbar that is concerned with the users account,
         * it gives the option to login, sign up and shows the profile icon.
         */}
        <div className="ml-auto flex">
          {isSignedIn === null ? (
            <div className="w-[150px] h-full" aria-hidden="true" />
          ) : isSignedIn ? (
            <div ref={accountMenuRef} className="relative h-full flex">
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={accountMenuOpen}
                onClick={() => setAccountMenuOpen((v) => !v)}
                className="aspect-square h-full p-2 flex items-center justify-center"
              >
                <div className="aspect-square rounded-full h-full overflow-hidden">
                  <Image
                    className="w-full h-full"
                    src={profilePic}
                    alt="profile picture"
                  />
                </div>
              </button>

              <div
                className={`absolute right-0 top-full min-w-[220px] bg-primary border border-secondary z-[60] origin-top-right transition-all duration-150 ${
                  accountMenuOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="px-4 py-2.5 border-b border-secondary text-[10px] uppercase tracking-[0.15em] opacity-60">
                  account
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    router.push("/dashboard");
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hover:bg-secondary/10"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    router.push("/dashboard/vitas");
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hover:bg-secondary/10"
                >
                  <FileText className="h-4 w-4" />
                  my vitas
                </button>
                <div className="h-px bg-secondary" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hover:bg-secondary/10"
                >
                  <LogOut className="h-4 w-4" />
                  sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="w-[150px] h-full flex flex-col">
              <Button
                ref={signInButton}
                className="flex-1 overflow-hidden"
                text="sign in"
                onClick={() => setActiveModal("signin")}
                capslock
                vibrate
              >
                <SignInGraphic />
              </Button>

              <div className="h-px bg-secondary" />

              <Button
                className="flex-1 overflow-hidden"
                onClick={() => setActiveModal("signup")}
                type="secondary"
                text="sign up"
                capslock
                vibrate
              >
                <SignUpGraphic />
              </Button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.nav-bracket-link)::before,
        :global(.nav-bracket-link)::after {
          content: "";
          position: absolute;
          top: 50%;
          color: var(--color-accent);
          font-family: "Fira Code", monospace;
          font-size: 14px;
          line-height: 1;
          opacity: 0;
          transition: opacity 0.18s ease, transform 0.18s ease;
          pointer-events: none;
        }
        :global(.nav-bracket-link)::before {
          content: "[";
          left: 6px;
          transform: translate(4px, -50%);
        }
        :global(.nav-bracket-link)::after {
          content: "]";
          right: 6px;
          transform: translate(-4px, -50%);
        }
        :global(.nav-bracket-link):hover::before,
        :global(.nav-bracket-link):hover::after {
          opacity: 1;
          transform: translate(0, -50%);
        }
      `}</style>

      {/** ANCHOR: Modals */}

      {/* Sign In Modal */}
      <div
        className={`fixed inset-0 z-[5000] flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300 ease-in-out ${
          activeModal === "signin" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setActiveModal(null)}
        onKeyDown={(e) => e.key === "Escape" && setActiveModal(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Sign In"
        tabIndex={-1}
      >
        <div
          className={`bg-primary w-[min(450px,95vw)] h-[min(500px,90vh)] border border-secondary relative transition-all duration-300 ease-in-out ${
            activeModal === "signin" ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <SignIn
            ButtonFunction={() => setActiveModal("signup")}
          />
        </div>
      </div>

      {/* Sign Up Modal */}
      <div
        className={`fixed inset-0 z-[5000] flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300 ease-in-out ${
          activeModal === "signup" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setActiveModal(null)}
        onKeyDown={(e) => e.key === "Escape" && setActiveModal(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Sign Up"
        tabIndex={-1}
      >
        <div
          className={`bg-primary w-[min(450px,95vw)] h-[min(500px,90vh)] border border-secondary relative transition-all duration-300 ease-in-out ${
            activeModal === "signup" ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <SignUp
            ButtonFunction={() => setActiveModal("signin")}
          />
        </div>
      </div>
    </>
  );
};

export default Navbar;
