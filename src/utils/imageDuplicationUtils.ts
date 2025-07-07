/**
 * Utility para detectar e evitar duplicação de imagens
 */

export const imageDuplicationUtils = {
  /**
   * Extrai URLs de imagens do markdown
   */
  extractImageUrlsFromMarkdown(markdown: string): string[] {
    if (!markdown) return [];
    
    const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
    const urls: string[] = [];
    let match;

    while ((match = imageRegex.exec(markdown)) !== null) {
      urls.push(match[1]);
    }

    return urls;
  },

  /**
   * Normaliza URL para comparação
   */
  normalizeUrlForComparison(url: string): string {
    return url
      .replace(/^https?:\/\/[^\/]+\//, '') // Remove protocol e domain
      .replace(/^\/+/, '') // Remove barras iniciais
      .toLowerCase();
  },

  /**
   * Verifica se duas URLs se referem à mesma imagem
   */
  isSameImage(url1: string, url2: string): boolean {
    const normalized1 = this.normalizeUrlForComparison(url1);
    const normalized2 = this.normalizeUrlForComparison(url2);
    
    return normalized1 === normalized2 || 
           normalized1.includes(normalized2) || 
           normalized2.includes(normalized1);
  },

  /**
   * Filtra imagens que já estão presentes no markdown
   */
  filterDuplicateImages(
    imageUrls: string[], 
    contextMarkdown: string = ''
  ): string[] {
    if (!contextMarkdown || imageUrls.length === 0) {
      return imageUrls;
    }

    const contextImages = this.extractImageUrlsFromMarkdown(contextMarkdown);
    
    if (contextImages.length === 0) {
      return imageUrls;
    }

    return imageUrls.filter(url => 
      !contextImages.some(contextUrl => this.isSameImage(url, contextUrl))
    );
  },

  /**
   * Remove duplicatas de uma lista de URLs
   */
  removeDuplicateUrls(urls: string[]): string[] {
    const unique: string[] = [];
    
    for (const url of urls) {
      if (!unique.some(existingUrl => this.isSameImage(url, existingUrl))) {
        unique.push(url);
      }
    }
    
    return unique;
  }
};
