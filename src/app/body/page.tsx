"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const BODY_REGIONS = ["torso", "arms", "legs"];

function hslColor(hue: number) {
  return `hsl(${hue}, 80%, 60%)`;
}

export default function BodyPage() {
  const [name, setName] = useState("");
  const [pickedColors, setPickedColors] = useState<string[]>([]);

  useEffect(() => {
    setName(localStorage.getItem("picky_name") || "");
  }, []);

  // Generate 36 swatches (every 10 degrees for performance)
  const colorSwatches = Array.from({ length: 36 }, (_, i) => hslColor(i * 10));

  function pickColor(color: string) {
    if (pickedColors.length < 5 && !pickedColors.includes(color)) {
      setPickedColors([...pickedColors, color]);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200">
      <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-center text-gray-700">
        {name ? name : "Sin nombre"}
      </h2>
      <div className="flex flex-row gap-8 items-start w-full justify-center">
        {/* Center SVG body */}
        <div className="flex flex-col items-center">
          <img src="/body.svg" alt="Cuerpo" className="w-48 h-auto mb-4" />
          <div className="flex gap-2 mt-2">
            {BODY_REGIONS.map((region) => (
              <span key={region} className="text-xs bg-gray-300 rounded px-2 py-1">
                {region}
              </span>
            ))}
          </div>
        </div>
        {/* Color wheel */}
        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-6 gap-1">
            {colorSwatches.map((color) => (
              <button
                key={color}
                className="w-7 h-7 rounded-full border-2 border-white shadow"
                style={{ background: color }}
                onClick={() => pickColor(color)}
                aria-label={`Elegir color ${color}`}
                disabled={pickedColors.includes(color) || pickedColors.length >= 5}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {pickedColors.map((color) => (
              <div
                key={color}
                className="w-10 h-6 rounded shadow border border-gray-400"
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 mt-2">
            Máximo 5 colores
          </span>
        </div>
      </div>
    </div>
  );
} 