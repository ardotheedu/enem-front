'use client';

import QuestionImage from './QuestionImage';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Função para processar markdown e renderizar imagens
  const renderContent = () => {
    // Regex para encontrar imagens no formato ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      // Adicionar texto antes da imagem
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push(
            <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
              {textBefore}
            </span>
          );
        }
      }

      // Adicionar a imagem
      const alt = match[1] || 'Imagem da questão';
      const src = match[2];
      
      parts.push(
        <div key={`image-${match.index}`} className="my-4">
          <QuestionImage
            src={src}
            alt={alt}
            className="mx-auto"
            maxWidth="100%"
          />
        </div>
      );

      lastIndex = imageRegex.lastIndex;
    }

    // Adicionar texto restante após a última imagem
    if (lastIndex < content.length) {
      const textAfter = content.slice(lastIndex);
      if (textAfter.trim()) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {textAfter}
          </span>
        );
      }
    }

    // Se não há imagens, retornar o texto simples
    if (parts.length === 0) {
      return <span className="whitespace-pre-wrap">{content}</span>;
    }

    return parts;
  };

  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
}
