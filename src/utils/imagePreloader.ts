/**
 * Utility para pré-carregar imagens e melhorar performance
 */

export class ImagePreloader {
  private static instance: ImagePreloader;
  private preloadedImages = new Set<string>();
  private loadingImages = new Map<string, Promise<void>>();

  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  /**
   * Pré-carrega uma imagem individual
   */
  async preloadImage(url: string): Promise<void> {
    if (this.preloadedImages.has(url)) {
      return Promise.resolve();
    }

    if (this.loadingImages.has(url)) {
      return this.loadingImages.get(url)!;
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.add(url);
        this.loadingImages.delete(url);
        resolve();
      };
      
      img.onerror = () => {
        console.warn(`Falha ao pré-carregar imagem: ${url}`);
        this.loadingImages.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });

    this.loadingImages.set(url, loadPromise);
    return loadPromise;
  }

  /**
   * Pré-carrega múltiplas imagens em paralelo
   */
  async preloadImages(urls: string[]): Promise<void> {
    const uniqueUrls = [...new Set(urls)].filter(url => 
      url && url.trim() && !this.preloadedImages.has(url)
    );

    if (uniqueUrls.length === 0) {
      return Promise.resolve();
    }

    console.log(`🖼️ Pré-carregando ${uniqueUrls.length} imagens...`);
    
    const startTime = Date.now();
    const results = await Promise.allSettled(
      uniqueUrls.map(url => this.preloadImage(url))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const duration = Date.now() - startTime;

    console.log(`✅ Pré-carregamento concluído: ${successful} sucessos, ${failed} falhas em ${duration}ms`);
  }

  /**
   * Extrai URLs de imagens do contexto markdown
   */
  extractImageUrls(markdown: string): string[] {
    const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
    const urls: string[] = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      urls.push(this.normalizeImageUrl(match[1]));
    }

    return urls;
  }

  /**
   * Normaliza URL de imagem para usar a API local
   */
  private normalizeImageUrl(url: string): string {
    // Se já é uma URL completa, retorna como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Se é um caminho relativo, construir URL com a API base
    if (url.startsWith('images/')) {
      return `http://localhost:3000/${url}`;
    }
    
    // Fallback para outros casos
    return url.startsWith('/') ? `http://localhost:3000${url}` : `http://localhost:3000/${url}`;
  }

  /**
   * Verifica se uma imagem já foi pré-carregada
   */
  isPreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }

  /**
   * Limpa o cache de imagens pré-carregadas
   */
  clearCache(): void {
    this.preloadedImages.clear();
    this.loadingImages.clear();
    console.log('🧹 Cache de imagens limpo');
  }

  /**
   * Retorna estatísticas do preloader
   */
  getStats(): { preloaded: number; loading: number } {
    return {
      preloaded: this.preloadedImages.size,
      loading: this.loadingImages.size
    };
  }
}

export const imagePreloader = ImagePreloader.getInstance();
