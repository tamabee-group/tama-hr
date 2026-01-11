"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ImageZoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt?: string;
}

export function ImageZoomDialog({
  open,
  onOpenChange,
  src,
  alt = "Image",
}: ImageZoomDialogProps) {
  // Không render nếu không có src
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/90 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{alt}</DialogTitle>
        </VisuallyHidden>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          centerOnInit
          wheel={{ step: 0.2 }}
          doubleClick={{ mode: "reset" }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent
                wrapperClass="w-full h-[95vh]"
                contentClass="w-full h-full flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                />
              </TransformComponent>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full text-white text-sm">
                <button
                  onClick={() => zoomOut()}
                  className="px-2 hover:text-primary"
                >
                  −
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="px-2 hover:text-primary"
                >
                  Reset
                </button>
                <button
                  onClick={() => zoomIn()}
                  className="px-2 hover:text-primary"
                >
                  +
                </button>
              </div>
            </>
          )}
        </TransformWrapper>
      </DialogContent>
    </Dialog>
  );
}
