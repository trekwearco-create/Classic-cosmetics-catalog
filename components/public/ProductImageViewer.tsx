"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type ViewerImage = {
  src: string;
  alt: string;
};

export default function ProductImageViewer({
  images,
  initialIndex,
  onClose,
}: {
  images: ViewerImage[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [photoIndex, setPhotoIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [photoSize, setPhotoSize] = useState({ width: 0, height: 0 });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const historyEntryRef = useRef(false);
  const gestureRef = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    onPhoto: boolean;
  } | null>(null);
  const movedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const tapPhotoRef = useRef(false);
  const current = images[photoIndex];
  const photoIndexRef = useRef(photoIndex);

  useLayoutEffect(() => {
    photoIndexRef.current = photoIndex;
  }, [photoIndex]);

  const measurePhoto = useCallback(() => {
    const photo = photoRef.current;
    const viewport = viewportRef.current;
    if (!photo || !viewport || !photo.naturalWidth || !photo.naturalHeight) {
      return;
    }
    const bounds = viewport.getBoundingClientRect();
    const fit = Math.min(
      bounds.width / photo.naturalWidth,
      bounds.height / photo.naturalHeight,
    );
    setPhotoSize({
      width: photo.naturalWidth * fit,
      height: photo.naturalHeight * fit,
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoomed(false);
    setOffset({ x: 0, y: 0 });
  }, []);

  const dismiss = useCallback(() => {
    if (historyEntryRef.current) {
      historyEntryRef.current = false;
      window.history.back();
    }
    onClose();
  }, [onClose]);

  const moveTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= images.length) return;
      setPhotoIndex(index);
      setPhotoSize({ width: 0, height: 0 });
      resetZoom();
    },
    [images.length, resetZoom],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    dialog.showModal();
    closeButtonRef.current?.focus();

    if (window.matchMedia("(max-width: 767px)").matches) {
      window.history.pushState(
        { ...window.history.state, __ccProductImageViewer: true },
        "",
        window.location.href,
      );
      historyEntryRef.current = true;
    }

    function handlePopState() {
      if (!historyEntryRef.current) return;
      historyEntryRef.current = false;
      onClose();
    }

    function handleCancel(event: Event) {
      event.preventDefault();
      dismiss();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveTo(photoIndexRef.current - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveTo(photoIndexRef.current + 1);
      }
    }

    window.addEventListener("popstate", handlePopState);
    dialog.addEventListener("cancel", handleCancel);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      dialog.removeEventListener("cancel", handleCancel);
      window.removeEventListener("keydown", handleKeyDown);
      if (dialog.open) dialog.close();
      root.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [dismiss, moveTo, onClose]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(measurePhoto);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [measurePhoto]);

  useEffect(() => {
    for (const neighbor of [photoIndex - 1, photoIndex + 1]) {
      const image = images[neighbor];
      if (!image) continue;
      const preload = new window.Image();
      preload.loading = "lazy";
      preload.decoding = "async";
      preload.src = image.src;
    }
  }, [images, photoIndex]);

  function clampOffset(x: number, y: number) {
    const viewport = viewportRef.current?.getBoundingClientRect();
    if (!viewport) return { x: 0, y: 0 };
    const limitX = Math.max(0, (photoSize.width * 2.5 - viewport.width) / 2);
    const limitY = Math.max(0, (photoSize.height * 2.5 - viewport.height) / 2);
    return {
      x: Math.min(limitX, Math.max(-limitX, x)),
      y: Math.min(limitY, Math.max(-limitY, y)),
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    suppressClickRef.current = false;
    tapPhotoRef.current = false;
    gestureRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
      onPhoto: event.target === photoRef.current,
    };
    movedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture) return;
    const deltaX = event.clientX - gesture.x;
    const deltaY = event.clientY - gesture.y;
    if (Math.abs(deltaX) >= 8 || Math.abs(deltaY) >= 8) {
      movedRef.current = true;
    }
    if (zoomed) {
      setOffset(clampOffset(gesture.offsetX + deltaX, gesture.offsetY + deltaY));
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture) return;
    const deltaX = event.clientX - gesture.x;
    const deltaY = event.clientY - gesture.y;
    if (!zoomed && Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      moveTo(photoIndex + (deltaX < 0 ? 1 : -1));
    }
    tapPhotoRef.current =
      gesture.onPhoto &&
      Math.abs(deltaX) < 8 &&
      Math.abs(deltaY) < 8;
    if (movedRef.current) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
        tapPhotoRef.current = false;
      }, 500);
    }
    gestureRef.current = null;
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!zoomed) return;
    event.preventDefault();
    setOffset(clampOffset(offset.x - event.deltaX, offset.y - event.deltaY));
  }

  if (!current) return null;

  return (
    <dialog
      ref={dialogRef}
      className="product-photo-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Product photo viewer"
      onClick={(event) => {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest("button, img")) {
          dismiss();
        }
      }}
    >
      <div className="product-photo-viewer-top">
        {images.length > 1 ? (
          <p className="product-photo-viewer-counter" aria-live="polite">
            <span aria-hidden="true">
              {photoIndex + 1} / {images.length}
            </span>
            <span className="sr-only">
              Photo {photoIndex + 1} of {images.length}
            </span>
          </p>
        ) : (
          <span />
        )}
        <button
          ref={closeButtonRef}
          type="button"
          className="product-photo-viewer-close"
          aria-label="Close"
          onClick={dismiss}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className="product-photo-viewer-stage">
        {images.length > 1 ? (
          <button
            type="button"
            className="product-photo-viewer-arrow"
            aria-label="Previous photo"
            disabled={photoIndex === 0}
            onClick={() => moveTo(photoIndex - 1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <span />
        )}
        <div
          ref={viewportRef}
          className={`product-photo-viewer-viewport${zoomed ? " is-zoomed" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={`${zoomed ? "Zoom out from" : "Zoom in on"} ${current.alt}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            gestureRef.current = null;
            suppressClickRef.current = true;
            window.setTimeout(() => {
              suppressClickRef.current = false;
              tapPhotoRef.current = false;
            }, 500);
          }}
          onWheel={handleWheel}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            setZoomed((value) => {
              if (value) setOffset({ x: 0, y: 0 });
              return !value;
            });
          }}
          onClick={(event) => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              tapPhotoRef.current = false;
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            if (tapPhotoRef.current || event.target === photoRef.current) {
              tapPhotoRef.current = false;
              event.stopPropagation();
              setZoomed((value) => {
                if (value) setOffset({ x: 0, y: 0 });
                return !value;
              });
            } else if (
              event.target === event.currentTarget &&
              event.detail === 0
            ) {
              event.stopPropagation();
              setZoomed((value) => {
                if (value) setOffset({ x: 0, y: 0 });
                return !value;
              });
            }
          }}
        >
          <Image
            key={current.src}
            ref={photoRef}
            src={current.src}
            alt={current.alt}
            width={photoSize.width || 1}
            height={photoSize.height || 1}
            unoptimized
            draggable={false}
            onLoad={measurePhoto}
            className="product-photo-viewer-image"
            style={{
              width: photoSize.width ? `${photoSize.width}px` : "100%",
              height: photoSize.height ? `${photoSize.height}px` : "100%",
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoomed ? 2.5 : 1})`,
            }}
          />
        </div>
        {images.length > 1 ? (
          <button
            type="button"
            className="product-photo-viewer-arrow"
            aria-label="Next photo"
            disabled={photoIndex === images.length - 1}
            onClick={() => moveTo(photoIndex + 1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ) : (
          <span />
        )}
      </div>
    </dialog>
  );
}
