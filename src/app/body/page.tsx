"use client";
import { useEffect, useState } from "react";
import { colorList } from "../../../picky/src/specialNames";

const BODY_REGIONS = ["torso", "arms", "legs"];

type ColorItem = { name: string; hex: string };

export default function BodyPage() {
  const [name, setName] = useState("");
  // Store pickedColors as hex codes
  const [pickedColors, setPickedColors] = useState<string[]>([]);
  // Store regionColors as hex codes
  const [regionColors, setRegionColors] = useState<{ [region: string]: string | null }>({ torso: null, arms: null, legs: null });
  // Store dragColor as hex code
  const [dragColor, setDragColor] = useState<string | null>(null);

  useEffect(() => {
    setName(localStorage.getItem("picky_name") || "");
  }, []);

  // Pick color by hex
  function pickColor(colorName: string) {
    const colorObj = colorList.find((c) => c.name === colorName);
    if (!colorObj) return;
    if (pickedColors.length < 5 && !pickedColors.includes(colorObj.hex)) {
      setPickedColors([...pickedColors, colorObj.hex]);
    }
  }

  // Remove picked color by hex
  function removePickedColor(hex: string) {
    setPickedColors(pickedColors.filter((c) => c !== hex));
    setRegionColors((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((region) => {
        if (updated[region] === hex) updated[region] = null;
      });
      return updated;
    });
  }

  function handleDragStart(hex: string) {
    setDragColor(hex);
  }

  function handleDragEnd() {
    setDragColor(null);
  }

  function handleDrop(region: string) {
    if (dragColor) {
      setRegionColors({ ...regionColors, [region]: dragColor });
      setDragColor(null);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen flex bg-gray-200">
      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-3xl font-bold mb-2">{name}</h1>
        {/* Inline SVG for body */}
        <svg width="200" height="400" viewBox="0 0 200 400" className="mb-4">
          <g
            id="torso"
            onDrop={() => handleDrop("torso")}
            onDragOver={handleDragOver}
            style={{ cursor: "pointer" }}
          >
            <rect x="75" y="80" width="50" height="100" rx="25" fill={regionColors.torso || "#E0E0E0"} />
          </g>
          <g
            id="arms"
            onDrop={() => handleDrop("arms")}
            onDragOver={handleDragOver}
            style={{ cursor: "pointer" }}
          >
            <rect x="40" y="90" width="30" height="90" rx="15" fill={regionColors.arms || "#C0C0C0"} />
            <rect x="130" y="90" width="30" height="90" rx="15" fill={regionColors.arms || "#C0C0C0"} />
          </g>
          <g
            id="legs"
            onDrop={() => handleDrop("legs")}
            onDragOver={handleDragOver}
            style={{ cursor: "pointer" }}
          >
            <rect x="85" y="180" width="15" height="80" rx="7" fill={regionColors.legs || "#A0A0A0"} />
            <rect x="100" y="180" width="15" height="80" rx="7" fill={regionColors.legs || "#A0A0A0"} />
          </g>
          <ellipse cx="100" cy="60" rx="25" ry="30" fill="#F0F0F0" />
        </svg>
        {/* Picked colors with remove button */}
        <div className="flex gap-2 mb-4">
          {pickedColors.map((hex) => {
            const colorObj = colorList.find((c) => c.hex === hex);
            return (
              <div
                key={hex}
                className="relative group flex flex-col items-center"
                draggable
                onDragStart={() => handleDragStart(hex)}
                onDragEnd={handleDragEnd}
                title={colorObj?.name || hex}
                style={{ opacity: dragColor === hex ? 0.5 : 1 }}
              >
                <div
                  className="w-10 h-10 rounded shadow border-2 border-white cursor-grab"
                  style={{ background: hex }}
                ></div>
                {/* Remove button */}
                <button
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                  onClick={() => removePickedColor(hex)}
                  aria-label="Eliminar color"
                  type="button"
                >
                  ×
                </button>
                {/* Tooltip */}
                <span className="absolute bottom-[-1.5rem] left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                  {colorObj?.name || hex}
                </span>
              </div>
            );
          })}
        </div>
        {/* Show region color names */}
        <div className="flex flex-col gap-1 mb-4">
          {BODY_REGIONS.map((region) => {
            const colorName = colorList.find((c) => c.hex === regionColors[region])?.name;
            return (
              <div key={region}>
                <span className="font-semibold capitalize">{region}:</span> {colorName || "Sin color"}
              </div>
            );
          })}
        </div>
      </div>
      {/* Color wheel */}
      <div className="w-64 p-4 flex flex-col items-center overflow-y-auto max-h-screen">
        <h2 className="text-lg font-semibold mb-2">Rueda de colores</h2>
        <div className="flex flex-wrap gap-1 justify-center">
          {colorList.map((color) => (
            <button
              key={color.name}
              className="w-7 h-7 rounded-full border-2 border-white shadow cursor-pointer relative group"
              style={{ background: color.hex }}
              onClick={() => pickColor(color.name)}
              title={color.name}
              type="button"
              disabled={pickedColors.includes(color.hex)}
            >
              {/* Tooltip */}
              <span className="absolute bottom-[-1.5rem] left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                {color.name}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-600">Máximo 5 colores</p>
      </div>
    </div>
  );
} 