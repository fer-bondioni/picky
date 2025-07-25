"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function hslToColorName(hue: number): string {
  // For now, just return hsl string; can be mapped to names if needed
  return `hsl(${hue}, 80%, 60%)`;
}

export default function Home() {
  const [bgHue, setBgHue] = useState(0);
  const [textHue, setTextHue] = useState(180);
  const [name, setName] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Animate background hue
  useEffect(() => {
    const interval = setInterval(() => {
      setBgHue((h) => (h + 0.2) % 360);
      setTextHue((h) => (h + 0.35) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Ensure text is readable (black/white based on bg)
  function getTextColor(hue: number) {
    // Use luminance to decide
    const l = 0.6; // fixed lightness
    return l > 0.5 ? "#222" : "#fff";
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && name.trim()) {
      const userName = name.trim();
      localStorage.setItem("picky_name", userName);
      router.push("/body");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center transition-colors duration-1000"
      style={{
        background: `linear-gradient(120deg, ${hslToColorName(
          bgHue
        )}, ${hslToColorName((bgHue + 60) % 360)})`,
      }}
    >
      <h1
        className="text-5xl sm:text-7xl font-bold mb-8 text-center drop-shadow-lg transition-colors duration-1000"
        style={{
          color: hslToColorName(textHue),
          WebkitTextStroke: "1px #fff",
        }}
      >
        Hola, Afortunada!
      </h1>
      <label className="flex flex-col items-center gap-4">
        <span className="text-lg sm:text-2xl text-white bg-black/40 rounded px-4 py-2">
          Escribe tu nombre y aprieta enter
        </span>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="mt-2 px-6 py-3 rounded-lg text-2xl text-center outline-none border-2 border-white/60 bg-white/80 focus:border-blue-400 transition w-72 shadow-lg"
          placeholder="Tu nombre..."
          autoFocus
        />
      </label>
    </div>
  );
}
