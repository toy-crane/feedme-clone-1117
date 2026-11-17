"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateDisplayName,
  type UpdateProfileState,
} from "@/features/profile/actions";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState<UpdateProfileState, FormData>(
    updateDisplayName,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="displayName">표시 이름</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          maxLength={50}
        />
      </div>
      {state && (
        <p
          role="status"
          className={
            state.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "저장하는 중..." : "저장"}
      </Button>
    </form>
  );
}
