"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Settings() {
  const [theme, setTheme] = useState("system");
  const [size, setSize] = useState("md");

  useEffect(() => {
    setTheme(localStorage.getItem("faultlines-theme") || "system");
    setSize(localStorage.getItem("faultlines-size") || "md");
  }, []);

  const save = (t: string, s: string) => {
    localStorage.setItem("faultlines-theme", t);
    localStorage.setItem("faultlines-size", s);
    setTheme(t);
    setSize(s);
    location.reload();
  };

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl">Settings</h1>
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Theme</label>
          <select value={theme} onChange={(e) => save(e.target.value, size)} className="border border-ink/20 bg-white dark:bg-ink rounded px-3 py-2">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Text size</label>
          <select value={size} onChange={(e) => save(theme, e.target.value)} className="border border-ink/20 bg-white dark:bg-ink rounded px-3 py-2">
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
      </div>
      <Link href="/" className="block mt-8 text-rust underline">Back to home</Link>
    </main>
  );
}
