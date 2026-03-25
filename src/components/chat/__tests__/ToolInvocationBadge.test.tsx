import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create in progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, false)).toBe("Creating /App.jsx");
});

test("getToolLabel: str_replace_editor create done", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, true)).toBe("Created /App.jsx");
});

test("getToolLabel: str_replace_editor str_replace in progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.tsx" }, false)).toBe("Editing /components/Button.tsx");
});

test("getToolLabel: str_replace_editor str_replace done", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.tsx" }, true)).toBe("Edited /components/Button.tsx");
});

test("getToolLabel: str_replace_editor insert treated as edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" }, false)).toBe("Editing /App.jsx");
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" }, true)).toBe("Edited /App.jsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" }, false)).toBe("Viewing /App.jsx");
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" }, true)).toBe("Viewed /App.jsx");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, false)).toBe("Reverting /App.jsx");
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, true)).toBe("Reverted /App.jsx");
});

test("getToolLabel: file_manager delete in progress", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/old.jsx" }, false)).toBe("Deleting /old.jsx");
});

test("getToolLabel: file_manager delete done", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/old.jsx" }, true)).toBe("Deleted /old.jsx");
});

test("getToolLabel: file_manager rename in progress", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, false)).toBe("Renaming /old.jsx");
});

test("getToolLabel: file_manager rename done", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, true)).toBe("Renamed /old.jsx → /new.jsx");
});

test("getToolLabel: unknown tool falls back to toolName", () => {
  expect(getToolLabel("some_other_tool", {}, false)).toBe("some_other_tool");
});

test("getToolLabel: missing args fall back to toolName", () => {
  expect(getToolLabel("str_replace_editor", {}, false)).toBe("str_replace_editor");
});

// --- ToolInvocationBadge component tests ---

test("ToolInvocationBadge shows friendly label for create in progress", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("ToolInvocationBadge shows friendly label for create done", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="OK"
    />
  );
  expect(screen.getByText("Created /App.jsx")).toBeDefined();
});

test("ToolInvocationBadge shows friendly label for str_replace done", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/components/Card.tsx" }}
      state="result"
      result="OK"
    />
  );
  expect(screen.getByText("Edited /components/Card.tsx")).toBeDefined();
});

test("ToolInvocationBadge shows friendly label for file delete done", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/unused.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );
  expect(screen.getByText("Deleted /unused.jsx")).toBeDefined();
});

test("ToolInvocationBadge shows spinner when in progress", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  // Spinner is an svg from Loader2
  expect(container.querySelector("svg")).toBeDefined();
  // No green dot
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationBadge shows green dot when done", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="OK"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolInvocationBadge treats result state without result value as in-progress", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result={undefined}
    />
  );
  // Still in-progress appearance
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});
