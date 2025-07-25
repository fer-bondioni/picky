"use client";
import { useEffect, useState } from "react";
import { colorList, specialNames } from "../../../picky/src/specialNames";
import { userPlaylists } from "../../../picky/src/spotifyPlaylists";
import { useRouter } from "next/navigation";

const BODY_REGIONS = ["torso", "brazos", "piernas"];

type ColorItem = { name: string; hex: string };

export default function BodyPage() {
  const [name, setName] = useState("");
  const [pickedColors, setPickedColors] = useState<string[]>([]);
  const [regionColors, setRegionColors] = useState<{ [region: string]: string | null }>({ torso: null, brazos: null, piernas: null });
  const [dragColor, setDragColor] = useState<string | null>(null);
  const [showFernandoQuestion, setShowFernandoQuestion] = useState(false);
  const [fernandoAnswer, setFernandoAnswer] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showSacredColors, setShowSacredColors] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("picky_name") || "";
    setName(storedName);

    // Agregar el reproductor de Spotify si el usuario tiene una playlist
    if (storedName && userPlaylists[storedName]) {
      const iframe = document.createElement("iframe");
      // Agregamos autoplay=1 y añadimos hide_preview=1 para forzar reproducción completa
      iframe.src = `https://open.spotify.com/embed/playlist/${userPlaylists[storedName]}?utm_source=generator&theme=0&autoplay=1&hide_preview=1`;
      iframe.width = "400";
      iframe.height = "80";
      iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
      iframe.style.cssText = "border-radius: 12px; position: fixed; bottom: 20px; right: 20px; z-index: 1000;";
      document.body.appendChild(iframe);
    }

    // Cleanup function para remover el reproductor cuando se desmonte el componente
    return () => {
      const iframes = document.querySelectorAll('iframe[src*="spotify"]');
      iframes.forEach(iframe => iframe.remove());
    };
  }, []);

  // Check if all regions are colored
  useEffect(() => {
    const allRegionsColored = BODY_REGIONS.every(region => regionColors[region] !== null);
    if (allRegionsColored) {
      setShowFernandoQuestion(true);
    }
  }, [regionColors]);

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
      setRegionColors(prev => {
        const newRegionColors = {
          ...prev,
          [region]: dragColor
        };
        return newRegionColors;
      });
      setPickedColors(prev => prev.filter(c => c !== dragColor));
      setDragColor(null);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function goBackToOrigin() {
    router.push("/");
  }

  function clearRegionColor(region: string) {
    setRegionColors(prev => ({
      ...prev,
      [region]: null
    }));
  }

  function askFernando() {
    // Increment attempts first
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // Check if user is a special name
    const userSpecialColors = specialNames[name];
    
    if (!userSpecialColors) {
      setFernandoAnswer("Fernando te condena");
      return;
    }

    // Get the colors currently applied to body regions
    const appliedColors = Object.values(regionColors)
      .filter((hex): hex is string => hex !== null)
      .map(hex => {
        const colorObj = colorList.find(c => c.hex === hex);
        return colorObj?.name;
      })
      .filter((name): name is string => name !== undefined);

    // Check if the applied colors match the user's special colors
    const matchingColors = appliedColors.filter(colorName => 
      userSpecialColors.includes(colorName)
    );

    // All colors must match the user's special colors for approval
    if (matchingColors.length === appliedColors.length && appliedColors.length > 0) {
      setFernandoAnswer("Fernando está de acuerdo");
    } else {
      setFernandoAnswer("Fernando te condena");
    }
  }

  function resetColors() {
    setRegionColors({ torso: null, brazos: null, piernas: null });
    setFernandoAnswer(null);
    setShowFernandoQuestion(false);
  }

  function handleActionAfterAnswer() {
    if (fernandoAnswer?.includes("acuerdo")) {
      router.push("/");
    } else if (attempts >= 3) {
      router.push("/?message=Vuelvas pronto 👋");
    } else {
      resetColors();
    }
  }

  function handleRevealSacredColors() {
    setShowSacredColors(true);
  }

  return (
    <div className="min-h-screen flex bg-gray-200">
      {/* Back button */}
      <button
        onClick={goBackToOrigin}
        className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
        type="button"
      >
        Volver al origen
      </button>

      {/* Reveal Sacred Colors button */}
      <button
        onClick={handleRevealSacredColors}
        className="absolute top-4 right-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
        type="button"
      >
        Revelar los colores sagrados
      </button>
      
      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-3xl font-bold mb-2">{name}</h1>
        {/* Container for SVG and tooltips */}
        <div className="relative mb-4">
          {/* Tooltips container positioned absolutely */}
          <div className="absolute w-full h-full pointer-events-none">
            {regionColors.torso && (
              <div 
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: '60px' }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {(colorList.find(c => c.hex === regionColors.torso)?.name) || "Color"}
                </div>
              </div>
            )}
            {regionColors.brazos && (
              <div 
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: '90px' }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {colorList.find(c => c.hex === regionColors.brazos)?.name || "Color"}
                </div>
              </div>
            )}
            {regionColors.piernas && (
              <div 
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: '160px' }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {colorList.find(c => c.hex === regionColors.piernas)?.name || "Color"}
                </div>
              </div>
            )}
          </div>
          {/* SVG with body parts */}
          <svg width="200" height="400" viewBox="0 0 200 400">
            <g
              id="torso"
              onDrop={() => handleDrop("torso")}
              onDragOver={handleDragOver}
              onClick={() => regionColors.torso && clearRegionColor("torso")}
              style={{ cursor: regionColors.torso ? "pointer" : "pointer" }}
              className="hover-group"
            >
              <rect x="75" y="80" width="50" height="100" rx="25" fill={regionColors.torso || "#E0E0E0"} />
              {regionColors.torso && (
                <g className="tooltip-container">
                  <rect
                    x="50"
                    y="40"
                    width="100"
                    height="30"
                    fill="black"
                    rx="4"
                    className="opacity-0 hover-group-hover:opacity-100 transition-opacity duration-200"
                  />
                  <text
                    x="100"
                    y="60"
                    textAnchor="middle"
                    fill="white"
                    className="text-xs opacity-0 hover-group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  >
                    {(colorList.find(c => c.hex === regionColors.torso)?.name) || "Color"}
                  </text>
                </g>
              )}
            </g>
            <g
              id="brazos"
              onDrop={() => handleDrop("brazos")}
              onDragOver={handleDragOver}
              onClick={() => regionColors.brazos && clearRegionColor("brazos")}
              style={{ cursor: regionColors.brazos ? "pointer" : "pointer" }}
              className="hover-group"
            >
              <rect x="40" y="90" width="30" height="90" rx="15" fill={regionColors.brazos || "#C0C0C0"} />
              <rect x="130" y="90" width="30" height="90" rx="15" fill={regionColors.brazos || "#C0C0C0"} />
              {regionColors.brazos && (
                <g className="tooltip-container">
                  <rect
                    x="50"
                    y="70"
                    width="100"
                    height="30"
                    fill="black"
                    rx="4"
                    className="opacity-0 hover-group-hover:opacity-100 transition-opacity duration-200"
                  />
                  <text
                    x="100"
                    y="90"
                    textAnchor="middle"
                    fill="white"
                    className="text-xs opacity-0 hover-group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  >
                    {colorList.find(c => c.hex === regionColors.brazos)?.name || "Color"}
                  </text>
                </g>
              )}
            </g>
            <g
              id="piernas"
              onDrop={() => handleDrop("piernas")}
              onDragOver={handleDragOver}
              onClick={() => regionColors.piernas && clearRegionColor("piernas")}
              style={{ cursor: regionColors.piernas ? "pointer" : "pointer" }}
              className="hover-group"
            >
              <rect x="85" y="180" width="15" height="80" rx="7" fill={regionColors.piernas || "#A0A0A0"} />
              <rect x="100" y="180" width="15" height="80" rx="7" fill={regionColors.piernas || "#A0A0A0"} />
              {regionColors.piernas && (
                <g className="tooltip-container">
                  <rect
                    x="50"
                    y="150"
                    width="100"
                    height="30"
                    fill="black"
                    rx="4"
                    className="opacity-0 hover-group-hover:opacity-100 transition-opacity duration-200"
                  />
                  <text
                    x="100"
                    y="170"
                    textAnchor="middle"
                    fill="white"
                    className="text-xs opacity-0 hover-group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  >
                    {colorList.find(c => c.hex === regionColors.piernas)?.name || "Color"}
                  </text>
                </g>
              )}
            </g>
            <ellipse cx="100" cy="60" rx="25" ry="30" fill="#F0F0F0" />
          </svg>
        </div>
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
        <div className="flex flex-wrap gap-1 justify-center mt-[200px]">
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

      {/* Modal de pregunta de Fernando */}
      {showFernandoQuestion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg transform transition-all">
            {!fernandoAnswer ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                  Pregúntale a Fernando si le gusta
                </h2>
                <p className="text-center text-gray-600 mb-4">
                  Intento {attempts + 1}/3
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={askFernando}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg shadow-md transition-colors font-semibold text-lg transform hover:scale-105 transition-transform duration-200"
                    type="button"
                  >
                    Preguntar
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className={`text-4xl font-bold mb-6 ${fernandoAnswer.includes("condena") ? "text-red-600" : "text-green-600"}`}>
                  {fernandoAnswer}
                </div>
                <p className="text-gray-600 mb-4">
                  Intento {attempts}/3
                </p>
                <button
                  onClick={handleActionAfterAnswer}
                  className={`${fernandoAnswer.includes("acuerdo") ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"} text-white px-6 py-3 rounded-lg shadow-md transition-colors font-semibold`}
                  type="button"
                >
                  {fernandoAnswer.includes("acuerdo") ? "¡Qué suertuda!" : 
                   attempts >= 3 ? "Vuelvas pronto 👋" : "Inténtalo de nuevo"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sacred Colors Modal */}
      {showSacredColors && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg max-h-[80vh] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              Colores Sagrados
            </h2>
            <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
              {Object.entries(specialNames).map(([userName, colors]) => (
                <div key={userName} className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2 capitalize">{userName}:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {colors.map(color => (
                      <li key={color} className="flex items-center gap-2">
                        <span>{color}</span>
                        <div
                          className="w-4 h-4 rounded-full inline-block border border-gray-300"
                          style={{
                            backgroundColor: colorList.find(c => c.name === color)?.hex || 'transparent'
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center pt-4 border-t">
              <button
                onClick={() => setShowSacredColors(false)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors font-semibold"
                type="button"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}