import { useState } from "react";

const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  " ": "/", ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--",
  "-": "-....-", "/": "-..-.", "@": ".--.-.", "&": ".-...", ":": "---...",
};

const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k])
);

function textToMorse(text: string): string {
  return text.toUpperCase().split("").map(c => MORSE[c] ?? "").filter(Boolean).join(" ");
}

function morseToText(morse: string): string {
  return morse.trim().split(" ").map(token => {
    if (token === "/") return " ";
    return REVERSE_MORSE[token] ?? "?";
  }).join("");
}

export default function MorseEncoderApp() {
  const [text, setText] = useState("HELLO WORLD");
  const [morse, setMorse] = useState(textToMorse("HELLO WORLD"));
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [speed, setSpeed] = useState(15);
  const [playing, setPlaying] = useState(false);

  function fromText(val: string) {
    setText(val);
    setMorse(textToMorse(val));
  }

  function fromMorse(val: string) {
    setMorse(val);
    setText(morseToText(val));
  }

  async function playAudio() {
    if (playing) return;
    setPlaying(true);
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    const ctx = new AudioContext();
    const dotDuration = 1.2 / speed; // seconds

    const sequence = morse.split("");
    let time = ctx.currentTime;

    for (const char of sequence) {
      if (char === ".") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 700;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.5, time + 0.005);
        gain.gain.setValueAtTime(0.5, time + dotDuration - 0.005);
        gain.gain.linearRampToValueAtTime(0, time + dotDuration);
        osc.start(time);
        osc.stop(time + dotDuration);
        time += dotDuration + dotDuration; // dot + gap
      } else if (char === "-") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 700;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.5, time + 0.005);
        gain.gain.setValueAtTime(0.5, time + dotDuration * 3 - 0.005);
        gain.gain.linearRampToValueAtTime(0, time + dotDuration * 3);
        osc.start(time);
        osc.stop(time + dotDuration * 3);
        time += dotDuration * 3 + dotDuration;
      } else if (char === " ") {
        time += dotDuration * 3;
      } else if (char === "/") {
        time += dotDuration * 7;
      }
    }

    setTimeout(() => setPlaying(false), (time - ctx.currentTime) * 1000 + 500);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setDirection("encode")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${direction === "encode" ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
        >
          Text → Morse
        </button>
        <button
          onClick={() => setDirection("decode")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${direction === "decode" ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
        >
          Morse → Text
        </button>
        <div className="flex items-center gap-2 ml-4">
          <label className="text-xs font-medium text-slate-500">Speed: {speed} WPM</label>
          <input type="range" min={5} max={40} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-24" />
        </div>
        <button
          onClick={playAudio}
          disabled={playing || !morse.trim()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
        >
          {playing ? "▶ Playing…" : "▶ Play Audio"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Text</h3>
          <textarea
            value={text}
            onChange={(e) => fromText(e.target.value)}
            className="min-h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            placeholder="Type text here…"
          />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-slate-950">Morse Code</h3>
          <textarea
            value={morse}
            onChange={(e) => fromMorse(e.target.value)}
            className="min-h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-blue-200"
            placeholder="Dots, dashes and spaces…"
          />
          <p className="mt-2 text-xs text-slate-400">Use space between letters, slash (/) for word separator</p>
        </section>
      </div>
    </div>
  );
}
