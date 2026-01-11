import loadImage from "blueimp-load-image";

/**
 * Compress và convert ảnh sang WebP
 * @param file - File ảnh gốc
 * @param maxWidth - Chiều rộng tối đa (default: 1200px)
 * @param quality - Chất lượng nén (default: 0.8 = 80%)
 */
export async function compressImageToWebP(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.9,
): Promise<File> {
  const MAX_OUTPUT_SIZE = 1 * 1024 * 1024; // 1MB

  if (!file.type.startsWith("image/")) {
    throw new Error("File không phải là ảnh");
  }

  return new Promise((resolve, reject) => {
    loadImage(
      file,
      (img) => {
        if (img instanceof Event) {
          reject(new Error("Không thể load ảnh"));
          return;
        }

        const canvas = img as HTMLCanvasElement;

        const compressWithQuality = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Không thể convert ảnh sang WebP"));
                return;
              }

              // Nếu vẫn quá 1MB và quality > 0.2, giảm quality
              if (blob.size > MAX_OUTPUT_SIZE && q > 0.2) {
                compressWithQuality(q - 0.1);
                return;
              }

              // Tạo tên file với timestamp: original_20260111_230500.webp
              const now = new Date();
              const timestamp = now
                .toISOString()
                .replace(/[-:T]/g, "")
                .slice(0, 15)
                .replace(/(\d{8})(\d{6})/, "$1_$2");
              const baseName = file.name.replace(/\.[^/.]+$/, "");
              const newFileName = `${baseName}_${timestamp}.webp`;

              const webpFile = new File([blob], newFileName, {
                type: "image/webp",
              });
              resolve(webpFile);
            },
            "image/webp",
            q,
          );
        };

        compressWithQuality(quality);
      },
      {
        maxWidth,
        canvas: true,
        orientation: true, // Auto-rotate iPhone images
      },
    );
  });
}
