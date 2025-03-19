"use client";
import { signInAction } from "@/actions/auth-action";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import todoappLogo from "@/public/logo/TODO.APP_preview.png";
import clsx from "clsx";
import { Loader, StepForward } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFormStatus } from "react-dom";

export default function LoginForm() {
  return (
    <AnimatedBackground>
    <main className="min-h-screen h-full">
      <div className="container relative m-0 mx-auto py-10 md:px-10">
        {/* Header / Logo */}
        <div className="max-width flex items-center justify-center lg:justify-between">
          <Link className="flex items-center gap-1" href="/loggedin">
            <Image
              src={todoappLogo}
              width="50"
              height="50"
              alt="logo"
              className="h-16 w-20 md:h-16 md:w-20"
            />
            <h1 className="text-xl hidden lg:flex font-medium text-gray-950 md:text-3xl">
              TODO App
            </h1>
          </Link>
          {/* Sign In with Google (Desktop) */}
          <div className="hidden lg:flex w-fit items-center">
            <form action={signInAction}>
              <GoogleSignInButton />
            </form>
          </div>
        </div>

        {/* Main Hero Text */}
        <div className="w-full px-4 pt-12 md:px-4 lg:px-8 xl:px-10 2xl:px-0">
          <div className="flex h-full w-full flex-col items-center justify-center">
            {/* Removed the “Powered by” span here */}

            <h1 className="inline-block text-center text-4xl font-medium tracking-tighter text-dark lg:text-7xl">
              A Productivity-Focused AI-Powered Task Manager
            </h1>
            <h2 className="mt-8 text-center text-xl font-light tracking-tight lg:text-3xl">
              TODO App seamlessly
              <span className="font-bold px-1">organizes your tasks</span> and
              <br className="hidden lg:inline-block" />
              <span className="font-bold px-1">predicts what&apos;s next</span>
              using AI.
            </h2>

            <div className="mt-12 flex flex-col gap-4">
              {/* “Get Started” Button */}
              <form action={signInAction}>
                <GetStartedButton />
              </form>

              {/* Removed the “Star on Github” button */}
            </div>
          </div>
        </div>
      </div>

      {/* Device Previews */}
      <div>
        <div className="flex items-center justify-center">
          <Image
            alt="mobile"
            loading="lazy"
            width="500"
            height="600"
            className="z-10 max-w-[400px]"
            src={"/mobile1.png"}
          />
          <Image
            src="/desktop1.png"
            alt="laptop"
            loading="lazy"
            width="1000"
            height="500"
            data-nimg="1"
            className="h-full -ml-28 mt-10 hidden lg:flex"
          />
        </div>
      </div>

      {/* Footer */}
      {/* Entire footer block removed to eliminate social media & “Powered by” texts */}
    </main>
    </AnimatedBackground>
  );
}

function GetStartedButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="flex items-center justify-center px-8 py-4 mb-2 me-2 overflow-hidden text-xl font-medium text-gray-100 rounded-xl group bg-gradient-to-br from-purple-600 to-orange-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-blue-800"
    >
      <span className="flex items-center gap-1">
        {pending ? (
          <span className="px-16">
            <Loader className="w-5 h-5" />
          </span>
        ) : (
          <>
            Get Started
            <StepForward />
          </>
        )}
      </span>
    </button>
  );
}

function GoogleSignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
    >
      <span
        className={clsx(
          "relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0",
          pending && "px-16"
        )}
      >
        {pending ? (
          <span>
            <Loader className="w-5 h-5" />
          </span>
        ) : (
          "Sign in with Google"
        )}
      </span>
    </button>
  );
}
