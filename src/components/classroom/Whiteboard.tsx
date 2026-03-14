"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Eraser, Trash2, Type, Pen } from "lucide-react";

const COLORS = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [tool, setTool] = useState<"pen" | "eraser" | "text">("pen");
  const [lineWidth, setLineWidth] = useState(2);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "text") {
      const point = getCanvasPoint(e);
      const text = prompt("Enter text:");
      if (text) {
        const ctx = canvasRef.current!.getContext("2d")!;
        ctx.fillStyle = color;
        ctx.font = "16px sans-serif";
        ctx.fillText(text, point.x, point.y);
      }
      return;
    }

    setIsDrawing(true);
    lastPoint.current = getCanvasPoint(e);
  };

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint.current) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const point = getCanvasPoint(e);

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? 20 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPoint.current = point;
  }, [isDrawing, color, tool, lineWidth]);

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Set canvas resolution
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-slate-50 border-b border-slate-200">
        <button
          onClick={() => setTool("pen")}
          className={`p-2 rounded-lg transition-colors ${tool === "pen" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-100"}`}
          title="Pen"
        >
          <Pen className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`p-2 rounded-lg transition-colors ${tool === "eraser" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-100"}`}
          title="Eraser"
        >
          <Eraser className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTool("text")}
          className={`p-2 rounded-lg transition-colors ${tool === "text" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-100"}`}
          title="Text"
        >
          <Type className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); setTool("pen"); }}
            className={`h-6 w-6 rounded-full border-2 transition-transform ${
              color === c && tool !== "eraser" ? "border-slate-900 scale-110" : "border-slate-200"
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <select
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1"
        >
          <option value={1}>Thin</option>
          <option value={2}>Medium</option>
          <option value={4}>Thick</option>
          <option value={8}>Bold</option>
        </select>

        <div className="flex-1" />

        <button
          onClick={clearCanvas}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          title="Clear all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full cursor-crosshair"
          style={{ touchAction: "none" }}
        />
      </div>
    </div>
  );
}
