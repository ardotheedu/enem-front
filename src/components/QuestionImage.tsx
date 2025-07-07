'use client';

import { useMemo } from 'react';

interface QuestionImageProps {
  src: string;
  alt?: string;
  className?: string;
  maxWidth?: string;
}

export default function QuestionImage({ 
  src, 
  alt = "Imagem da questão", 
  className = "",
  maxWidth = "100%"
}: QuestionImageProps) {
  
  // Normalizar URL da imagem
  const imageUrl = useMemo(() => {
    // Se já é uma URL completa, retorna como está
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // Se é um caminho relativo, construir URL com a API base
    if (src.startsWith('images/')) {
      return `http://localhost:3000/${src}`;
    }
    
    // Fallback para outros casos
    return src.startsWith('/') ? `http://localhost:3000${src}` : `http://localhost:3000/${src}`;
  }, [src]);

  return (
    <div className={`${className} overflow-hidden rounded-lg`} style={{ maxWidth }}>
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-auto object-contain bg-white shadow-sm"
        style={{ maxWidth: '100%', height: 'auto' }}
        loading="lazy"
      />
    </div>
  );
}
