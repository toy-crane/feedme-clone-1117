"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeNextPath } from "@/features/auth/safe-next-path";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "sign-up";

const COPY = {
  login: {
    title: "로그인",
    description: "이메일과 비밀번호로 로그인합니다.",
    submit: "로그인",
    pending: "로그인하는 중...",
    switchText: "계정이 없나요?",
    switchLabel: "회원가입",
    switchHref: "/auth/sign-up",
  },
  "sign-up": {
    title: "회원가입",
    description: "이메일과 비밀번호로 계정을 만듭니다.",
    submit: "가입하기",
    pending: "가입하는 중...",
    switchText: "이미 계정이 있나요?",
    switchLabel: "로그인",
    switchHref: "/auth/login",
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }) {
  const copy = COPY[mode];
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "sign-up" && password !== repeatPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    // 이메일 확인이 꺼져 있어 가입 직후 세션이 만들어진다.
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next");
    router.push(safeNextPath(next, "/"));
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mode === "sign-up" && (
            <div className="grid gap-2">
              <Label htmlFor="repeat-password">비밀번호 확인</Label>
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? copy.pending : copy.submit}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {copy.switchText}{" "}
            <Link
              href={copy.switchHref}
              className="text-foreground underline underline-offset-4"
            >
              {copy.switchLabel}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
