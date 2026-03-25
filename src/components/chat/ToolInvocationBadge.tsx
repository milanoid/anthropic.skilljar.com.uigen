"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  done: boolean
): string {
  const path = typeof args.path === "string" ? args.path : "";
  const command = typeof args.command === "string" ? args.command : "";

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return done ? `Created ${path}` : `Creating ${path}`;
      case "str_replace":
      case "insert":
        return done ? `Edited ${path}` : `Editing ${path}`;
      case "view":
        return done ? `Viewed ${path}` : `Viewing ${path}`;
      case "undo_edit":
        return done ? `Reverted ${path}` : `Reverting ${path}`;
    }
  }

  if (toolName === "file_manager") {
    const newPath = typeof args.new_path === "string" ? args.new_path : "";
    switch (command) {
      case "rename":
        return done
          ? `Renamed ${path} → ${newPath}`
          : `Renaming ${path}`;
      case "delete":
        return done ? `Deleted ${path}` : `Deleting ${path}`;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({
  toolName,
  args,
  state,
  result,
}: ToolInvocationBadgeProps) {
  const done = state === "result" && !!result;
  const label = getToolLabel(toolName, args, done);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
