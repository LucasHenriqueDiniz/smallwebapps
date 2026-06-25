import { useState, useCallback } from "react";

interface ExifSection {
  title: string;
  fields: { label: string; value: string }[];
}

function toDMS(decimal: number, isLat: boolean): string {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = ((minFull - min) * 60).toFixed(1);
  const dir = isLat ? (decimal >= 0 ? "N" : "S") : (decimal >= 0 ? "E" : "W");
  return `${deg}° ${min}' ${sec}" ${dir}`;
}

export default function ExifViewerApp() {
  const [sections, setSections] = useState<ExifSection[]>([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setError("");
    setSections([]);
    setFileName(file.name);
    try {
      const exifr = (await import("exifr")).default;
      const data = await exifr.parse(file, { tiff: true, exif: true, gps: true, iptc: false });
      if (!data || Object.keys(data).length === 0) {
        setError("No EXIF data found in this file.");
        return;
      }

      const camera: ExifSection = { title: "Camera", fields: [] };
      if (data.Make) camera.fields.push({ label: "Make", value: String(data.Make) });
      if (data.Model) camera.fields.push({ label: "Model", value: String(data.Model) });
      if (data.LensModel) camera.fields.push({ label: "Lens", value: String(data.LensModel) });
      if (data.Software) camera.fields.push({ label: "Software", value: String(data.Software) });

      const image: ExifSection = { title: "Image", fields: [] };
      if (data.ImageWidth) image.fields.push({ label: "Width", value: `${data.ImageWidth}px` });
      if (data.ImageHeight) image.fields.push({ label: "Height", value: `${data.ImageHeight}px` });
      if (data.ColorSpace) image.fields.push({ label: "Color Space", value: String(data.ColorSpace) });
      if (data.BitsPerSample) image.fields.push({ label: "Bits per Sample", value: String(data.BitsPerSample) });
      if (data.Orientation) image.fields.push({ label: "Orientation", value: String(data.Orientation) });

      const exposure: ExifSection = { title: "Exposure", fields: [] };
      if (data.ExposureTime) exposure.fields.push({ label: "Exposure Time", value: `1/${Math.round(1 / data.ExposureTime)}s` });
      if (data.FNumber) exposure.fields.push({ label: "Aperture", value: `f/${data.FNumber}` });
      if (data.ISO) exposure.fields.push({ label: "ISO", value: String(data.ISO) });
      if (data.FocalLength) exposure.fields.push({ label: "Focal Length", value: `${data.FocalLength}mm` });
      if (data.Flash !== undefined) exposure.fields.push({ label: "Flash", value: String(data.Flash) });
      if (data.WhiteBalance !== undefined) exposure.fields.push({ label: "White Balance", value: String(data.WhiteBalance) });

      const dates: ExifSection = { title: "Dates", fields: [] };
      if (data.DateTimeOriginal) dates.fields.push({ label: "Date Taken", value: String(data.DateTimeOriginal) });
      if (data.CreateDate) dates.fields.push({ label: "Create Date", value: String(data.CreateDate) });
      if (data.ModifyDate) dates.fields.push({ label: "Modify Date", value: String(data.ModifyDate) });

      const gps: ExifSection = { title: "GPS", fields: [] };
      if (data.latitude !== undefined && data.longitude !== undefined) {
        gps.fields.push({ label: "Latitude", value: `${data.latitude.toFixed(6)} (${toDMS(data.latitude, true)})` });
        gps.fields.push({ label: "Longitude", value: `${data.longitude.toFixed(6)} (${toDMS(data.longitude, false)})` });
        gps.fields.push({ label: "Google Maps", value: `https://maps.google.com/?q=${data.latitude},${data.longitude}` });
      }
      if (data.GPSAltitude) gps.fields.push({ label: "Altitude", value: `${data.GPSAltitude.toFixed(1)}m` });

      setSections([camera, image, exposure, dates, gps].filter(s => s.fields.length > 0));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read EXIF data.");
    }
  }, []);

  function copyAll() {
    const json = JSON.stringify(
      Object.fromEntries(sections.map(s => [s.title, Object.fromEntries(s.fields.map(f => [f.label, f.value]))])),
      null, 2
    );
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <section
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer ${
          isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = () => { const f = inp.files?.[0]; if (f) processFile(f); }; inp.click(); }}
      >
        <p className="text-sm font-medium text-slate-700">Drop an image here or click to browse</p>
        <p className="mt-1 text-xs text-slate-400">JPEG and TIFF files have the richest EXIF data</p>
      </section>

      {error && <p className="text-sm font-medium text-red-600 rounded-2xl border border-red-200 bg-red-50 p-4">✗ {error}</p>}

      {sections.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">{fileName}</p>
            <button onClick={copyAll} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
              {copied ? "✓ Copied" : "Copy all as JSON"}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-base font-semibold text-slate-950">{section.title}</h3>
                <dl className="space-y-2">
                  {section.fields.map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4 text-sm">
                      <dt className="shrink-0 font-medium text-slate-500">{label}</dt>
                      <dd className="text-right text-slate-800 break-all">
                        {value.startsWith("https://maps") ? (
                          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open in Maps</a>
                        ) : value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
