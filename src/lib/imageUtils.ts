import dopaLogo from "@/assets/dopa-logo.png";

export const addDopaLogoToImage = async (imageFile: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const logo = new Image();
    
    img.onload = () => {
      logo.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Calculate logo size (10% of image width, maintaining aspect ratio)
        const logoWidth = img.width * 0.1;
        const logoHeight = (logo.height / logo.width) * logoWidth;
        
        // Position logo at bottom right with padding
        const padding = img.width * 0.02;
        const logoX = img.width - logoWidth - padding;
        const logoY = img.height - logoHeight - padding;
        
        // Draw logo
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          0.95
        );
      };
      
      logo.onerror = () => reject(new Error('Failed to load DOPA logo'));
      logo.src = dopaLogo;
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
};
