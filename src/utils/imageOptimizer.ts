/**
 * Utility para otimização avançada de imagens
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  maxWidth?: number;
  maxHeight?: number;
}

export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  /**
   * Constrói URL otimizada para a API
   */
  buildOptimizedUrl(
    originalUrl: string,
    options: ImageOptimizationOptions = {}
  ): string {
    const { quality = 85, maxWidth, maxHeight } = options;
    
    // Se não há parâmetros de otimização, retorna URL original
    if (!maxWidth && !maxHeight && quality === 85) {
      return originalUrl;
    }

    // Construir query params para otimização
    const params = new URLSearchParams();
    
    if (maxWidth) params.set('w', maxWidth.toString());
    if (maxHeight) params.set('h', maxHeight.toString());
    if (quality !== 85) params.set('q', quality.toString());

    // Se a URL já tem query params, adicionar aos existentes
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}${params.toString()}`;
  }

  /**
   * Detecta o formato de imagem suportado pelo navegador
   */
  getSupportedFormat(): 'webp' | 'jpeg' {
    if (typeof window === 'undefined') return 'jpeg';
    
    // Verificar suporte a WebP
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      const webpData = canvas.toDataURL('image/webp');
      return webpData.startsWith('data:image/webp') ? 'webp' : 'jpeg';
    } catch {
      return 'jpeg';
    }
  }

  /**
   * Calcula dimensões otimizadas mantendo aspect ratio
   */
  calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number
  ): { width: number; height: number } {
    if (!maxWidth && !maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    if (maxWidth && maxHeight) {
      const widthRatio = maxWidth / originalWidth;
      const heightRatio = maxHeight / originalHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      
      return {
        width: Math.round(originalWidth * ratio),
        height: Math.round(originalHeight * ratio)
      };
    }

    if (maxWidth) {
      return {
        width: maxWidth,
        height: Math.round(maxWidth / aspectRatio)
      };
    }

    if (maxHeight) {
      return {
        width: Math.round(maxHeight * aspectRatio),
        height: maxHeight
      };
    }

    return { width: originalWidth, height: originalHeight };
  }

  /**
   * Verifica se a imagem precisa de otimização
   */
  needsOptimization(
    width: number,
    height: number,
    options: ImageOptimizationOptions
  ): boolean {
    const { maxWidth, maxHeight } = options;
    
    if (maxWidth && width > maxWidth) return true;
    if (maxHeight && height > maxHeight) return true;
    
    return false;
  }

  /**
   * Gera srcset para responsive images
   */
  generateSrcSet(baseUrl: string, breakpoints: number[] = [320, 640, 768, 1024, 1280]): string {
    return breakpoints
      .map(width => {
        const optimizedUrl = this.buildOptimizedUrl(baseUrl, { maxWidth: width });
        return `${optimizedUrl} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Estima o tamanho da imagem em bytes
   */
  estimateImageSize(width: number, height: number, format: 'webp' | 'jpeg' | 'png'): number {
    const pixels = width * height;
    
    // Estimativas baseadas em compressão média
    switch (format) {
      case 'webp':
        return Math.round(pixels * 0.3); // WebP ~30% menor que JPEG
      case 'jpeg':
        return Math.round(pixels * 0.4); // JPEG comprimido
      case 'png':
        return Math.round(pixels * 1.2); // PNG sem perda
      default:
        return Math.round(pixels * 0.4);
    }
  }

  /**
   * Monitora performance de carregamento de imagens
   */
  createPerformanceObserver(): PerformanceObserver | null {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return null;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('localhost:3000/images/')) {
          console.log(`📊 Imagem carregada: ${entry.name}`);
          console.log(`⏱️ Tempo: ${entry.duration.toFixed(2)}ms`);
          
          // Verificar se é uma PerformanceResourceTiming
          if ('transferSize' in entry) {
            const resourceEntry = entry as PerformanceResourceTiming;
            console.log(`📦 Tamanho: ${resourceEntry.transferSize || 0} bytes`);
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
      return observer;
    } catch {
      return null;
    }
  }
}

export const imageOptimizer = ImageOptimizer.getInstance();
