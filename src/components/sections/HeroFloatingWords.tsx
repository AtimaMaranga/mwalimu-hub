/**
 * Decorative floating Swahili word bubbles for the hero section.
 * Pure CSS animation — no client-side JS needed.
 */

const words: {
  text: string;
  top: string;
  side: { left?: string; right?: string };
  delay: string;
  size: string;
  opacity: string;
}[] = [
  { text: "Karibu",    top: "10%", side: { left: "2%" },   delay: "0s",    size: "1.1rem",  opacity: "0.07" },
  { text: "Habari?",   top: "65%", side: { left: "4%" },   delay: "0.9s",  size: "0.95rem", opacity: "0.055" },
  { text: "Asante",    top: "18%", side: { right: "3%" },  delay: "0.45s", size: "1.0rem",  opacity: "0.065" },
  { text: "Pole pole", top: "55%", side: { right: "2%" },  delay: "1.3s",  size: "0.85rem", opacity: "0.05" },
  { text: "Jambo!",    top: "82%", side: { left: "16%" },  delay: "0.65s", size: "0.9rem",  opacity: "0.055" },
  { text: "Kwaheri",   top: "38%", side: { left: "1%" },   delay: "1.7s",  size: "0.8rem",  opacity: "0.045" },
  { text: "Rafiki",    top: "30%", side: { right: "10%" }, delay: "2.1s",  size: "0.78rem", opacity: "0.04" },
  { text: "Nakupenda", top: "74%", side: { right: "6%" },  delay: "2.5s",  size: "0.75rem", opacity: "0.04" },
];

export default function HeroFloatingWords() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {words.map(({ text, top, side, delay, size, opacity }) => (
        <span
          key={text}
          className="absolute font-bold text-white animate-float select-none tracking-wide"
          style={{
            top,
            ...side,
            fontSize: size,
            opacity,
            animationDelay: delay,
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}
