"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/lib/actions/auth";
import { turnstileConfig } from "@/lib/turnstile-config";

export default function LoginForm({ turnstileEnabled }: { turnstileEnabled: boolean }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <div className="card w-full max-w-sm p-6 sm:p-8">
      <h1 className="mb-6 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
        Admin login
      </h1>
      <form action={formAction} className="flex flex-col gap-4">
        <label className="text-sm font-semibold" htmlFor="email">
          Email
        </label>
        <input
          className="field"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <label className="text-sm font-semibold" htmlFor="password">
          Password
        </label>
        <input
          className="field"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {turnstileEnabled ? (
          <div
            className="cf-turnstile"
            data-sitekey={turnstileConfig.siteKey}
            data-theme="light"
          />
        ) : null}
        {state.error ? (
          <p className="text-sm font-semibold" style={{ color: "var(--rose)" }} role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          className="btn-primary mt-2 w-full"
          type="submit"
          disabled={pending}
        >
          {pending ? "Logging in" : "Log in"}
        </button>
      </form>
    </div>
  );
}
