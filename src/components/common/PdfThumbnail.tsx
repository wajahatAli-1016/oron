import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type RenderTask } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerSrc;

type Props = {
  fileUrl: string;
  className?: string;
};

export function PdfThumbnail({ fileUrl, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cleanupDoc: (() => void) | null = null;

    const run = async () => {
      try {
        setIsRendering(true);
        const doc = await getDocument(fileUrl).promise;
        cleanupDoc = () => {
          try {
            void doc.destroy();
          } catch {
            // ignore
          }
        };

        const page = await doc.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Fit page into a ~96px square, preserve aspect ratio.
        const unscaledViewport = page.getViewport({ scale: 1 });
        const target = 96;
        const scale = Math.min(target / unscaledViewport.width, target / unscaledViewport.height);
        const viewport = page.getViewport({ scale });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // HiDPI support
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch {
        // ignore; we'll show empty canvas container
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
      try {
        renderTaskRef.current?.cancel();
      } catch {
        // ignore
      } finally {
        renderTaskRef.current = null;
      }
      if (cleanupDoc) cleanupDoc();
    };
  }, [fileUrl]);

  return (
    <div
      className={
        className ??
        'relative h-24 w-24 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center'
      }
    >
      <canvas ref={canvasRef} className="block" />
      {isRendering && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] text-slate-500">
          Loading…
        </div>
      )}
    </div>
  );
}

