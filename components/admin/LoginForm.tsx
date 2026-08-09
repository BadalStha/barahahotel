"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Lock, Mail } from "lucide-react";

import { loginAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MountainDivider } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { loginSchema, type LoginFormValues } from "@/lib/validators/auth";

const inputClasses =
  "h-11 w-full rounded-xl border border-charcoal/15 bg-white/80 px-4 text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20";

const inputErrorClasses =
  "border-terracotta focus:border-terracotta focus:ring-terracotta/20";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginFormValues) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await loginAction(values, callbackUrl);
        if (result?.error) setError(result.error);
      } catch (error) {
        const digest = (error as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          // A successful sign-in throws a redirect; anything else is real
          console.error("Sign-in failed:", error);
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <Card className="flex flex-col gap-6 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
          Baraha Hotel and Lodge
        </p>
        <h1 className="font-display text-3xl text-charcoal">Admin Sign In</h1>
        <p className="text-sm text-charcoal/60">
          Bhedetar, Dhankuta — staff entrance
        </p>
        <MountainDivider />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-charcoal">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-charcoal/40" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@barahahotel.com"
              className={cn(inputClasses, "pl-10", errors.email && inputErrorClasses)}
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p className="text-xs text-terracotta">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-charcoal">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-charcoal/40" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={cn(inputClasses, "pl-10", errors.password && inputErrorClasses)}
              {...register("password")}
            />
          </div>
          {errors.password ? (
            <p className="text-xs text-terracotta">{errors.password.message}</p>
          ) : null}
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <Button type="submit" className="mt-1 w-full" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </Button>

        {process.env.NODE_ENV !== "production" ? (
          <p className="text-center text-xs text-charcoal/50">
            Seeded admin: admin@barahahotel.com · password in .env
            (ADMIN_PASSWORD)
          </p>
        ) : null}
      </form>
    </Card>
  );
}
