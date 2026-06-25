import { useCallback, useEffect, useState } from "react";

const WORDS = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"];

const LOREM_IPSUM_START = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generateSentence(wordCount = 8 + Math.floor(Math.random() * 10)) {
  const words = Array.from({ length: wordCount }, randomWord);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph(sentenceCount = 4 + Math.floor(Math.random() * 3)) {
  return Array.from({ length: sentenceCount }, generateSentence).join(" ");
}

export default function LoremIpsumApp() {
  const [type, setType] = useState<"words" | "sentences" | "paragraphs">("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    if (type === "words") {
      const words = Array.from({ length: count }, randomWord);
      if (startWithLorem && count >= 2) {
        words[0] = "Lorem";
        words[1] = "ipsum";
      }
      setOutput(words.join(" ") + ".");
    } else if (type === "sentences") {
      const sentences = Array.from({ length: count }, generateSentence);
      if (startWithLorem) sentences[0] = LOREM_IPSUM_START;
      setOutput(sentences.join(" "));
    } else {
      const paragraphs = Array.from({ length: count }, generateParagraph);
      if (startWithLorem) paragraphs[0] = LOREM_IPSUM_START + " " + Array.from({ length: 2 }, generateSentence).join(" ");
      setOutput(paragraphs.join("\n\n"));
    }
  }, [type, count, startWithLorem]);

  useEffect(() => { generate(); }, [generate]);

  function handleCopy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-950">Generator settings</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "words" | "sentences" | "paragraphs")}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none"
            >
              <option value="words">Words</option>
              <option value="sentences">Sentences</option>
              <option value="paragraphs">Paragraphs</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Count</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
            />
            Start with "Lorem ipsum…"
          </label>
          <button
            onClick={generate}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Generate
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-950">Output</h3>
          <button
            onClick={handleCopy}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <textarea
          readOnly
          value={output}
          className="min-h-64 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed outline-none"
        />
      </section>
    </div>
  );
}
