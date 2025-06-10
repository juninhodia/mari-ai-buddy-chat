import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

export interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage: React.FC<MessageProps> = ({ content, isUser, timestamp }) => {
  const currentTime = timestamp || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  // URL regex pattern to identify links in message content
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;
  const links = content.match(urlRegex) || [];
  
  // Image regex pattern to identify image URLs (including those in markdown format)
  const imageRegex = /(https?:\/\/[^\s\)]+\.(jpg|jpeg|png|gif|webp|bmp|svg))/gi;
  const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s\)]+\.(jpg|jpeg|png|gif|webp|bmp|svg))\)/gi;
  
  // Extract image URLs from both direct URLs and markdown format
  const directImageUrls = content.match(imageRegex) || [];
  const markdownImages = [...content.matchAll(markdownImageRegex)];
  const markdownImageUrls = markdownImages.map(match => match[2]);
  
  // Combine all image URLs
  const allImageUrls = [...directImageUrls, ...markdownImageUrls];
  
  // Filter out image URLs from regular links
  const nonImageLinks = links.filter(link => 
    !allImageUrls.some(imageUrl => imageUrl === link)
  );
  
  // Function to open the link in a new tab
  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Function to process bold text (**text**)
  const processBoldText = (text: string): (string | JSX.Element)[] => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add bold text
      parts.push(
        <strong key={`bold-${match.index}`} className="font-bold">
          {match[1]}
        </strong>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last bold part
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  // Function to render message content with images and formatting
  const renderMessageContent = () => {
    if (allImageUrls.length === 0 && markdownImages.length === 0) {
      // No images, just process bold text
      const boldProcessedParts = processBoldText(content);
      return (
        <span className="whitespace-pre-wrap">
          {boldProcessedParts.map((part, index) => (
            <React.Fragment key={index}>{part}</React.Fragment>
          ))}
        </span>
      );
    }

    let processedContent = content;
    const parts: (string | JSX.Element)[] = [];
    let imageIndex = 0;

    // First, process markdown images
    markdownImages.forEach((match) => {
      const fullMatch = match[0]; // Full markdown syntax: ![alt](url)
      const altText = match[1]; // Alt text
      const imageUrl = match[2]; // Image URL
      
      const splitParts = processedContent.split(fullMatch);
      
      // Add text before image (with bold processing)
      if (splitParts[0]) {
        const boldProcessedParts = processBoldText(splitParts[0]);
        parts.push(
          <span key={`text-before-markdown-${imageIndex}`} className="whitespace-pre-wrap">
            {boldProcessedParts.map((part, partIndex) => (
              <React.Fragment key={partIndex}>{part}</React.Fragment>
            ))}
          </span>
        );
      }
      
      // Add image
      parts.push(
        <div key={`markdown-image-${imageIndex}`} className="my-2">
          <img
            src={imageUrl}
            alt={altText || "Imagem"}
            className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
            onError={(e) => {
              // Se a imagem falhar ao carregar, mostra texto alternativo
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="text-sm text-gray-500 italic p-2 border border-gray-200 rounded bg-gray-50">Imagem não pôde ser carregada: ${imageUrl}</div>`;
              }
            }}
          />
        </div>
      );
      
      // Update processed content
      processedContent = splitParts.slice(1).join(fullMatch);
      imageIndex++;
    });

    // Then, process direct image URLs that weren't already processed by markdown
    const remainingDirectImages = directImageUrls.filter(url => 
      !markdownImageUrls.includes(url)
    );

    remainingDirectImages.forEach((imageUrl) => {
      const splitParts = processedContent.split(imageUrl);
      
      // Add text before image (with bold processing)
      if (splitParts[0]) {
        const boldProcessedParts = processBoldText(splitParts[0]);
        parts.push(
          <span key={`text-before-direct-${imageIndex}`} className="whitespace-pre-wrap">
            {boldProcessedParts.map((part, partIndex) => (
              <React.Fragment key={partIndex}>{part}</React.Fragment>
            ))}
          </span>
        );
      }
      
      // Add image
      parts.push(
        <div key={`direct-image-${imageIndex}`} className="my-2">
          <img
            src={imageUrl}
            alt="Imagem"
            className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
            onError={(e) => {
              // Se a imagem falhar ao carregar, mostra texto alternativo
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="text-sm text-gray-500 italic p-2 border border-gray-200 rounded bg-gray-50">Imagem não pôde ser carregada: ${imageUrl}</div>`;
              }
            }}
          />
        </div>
      );
      
      // Update processed content
      processedContent = splitParts.slice(1).join(imageUrl);
      imageIndex++;
    });
    
    // Add remaining text (with bold processing)
    if (processedContent.trim()) {
      const boldProcessedParts = processBoldText(processedContent);
      parts.push(
        <span key="remaining-text" className="whitespace-pre-wrap">
          {boldProcessedParts.map((part, partIndex) => (
            <React.Fragment key={partIndex}>{part}</React.Fragment>
          ))}
        </span>
      );
    }

    return (
      <div className="flex flex-col">
        {parts.map((item, index) => (
          <React.Fragment key={index}>
            {item}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return isUser ? (
    <div className="message user-message max-w-[80%] p-3 px-4 rounded-[18px] rounded-br-[4px] mb-[15px] bg-mari-primary-green text-white self-end">
      {renderMessageContent()}
      <div className="message-time text-xs text-white/70 mt-1 text-right">
        {currentTime}
      </div>
    </div>
  ) : (
    <div className="flex flex-col">
      <div className="assistant-bubble flex gap-2 items-start">
        <div className="assistant-avatar w-7 h-7 min-w-7 bg-mari-primary-green rounded-full flex items-center justify-center text-white font-bold text-sm">
          M
        </div>
        <div className="message assistant-message max-w-[80%] p-3 px-4 rounded-[18px] rounded-bl-[4px] mb-[4px] bg-gray-100 text-[#333] self-start">
          {renderMessageContent()}
          <div className="message-time text-xs text-black/50 mt-1 text-right">
            {currentTime}
          </div>
        </div>
      </div>
      
      {/* Show link buttons if any non-image links are found */}
      {nonImageLinks.length > 0 && (
        <div className="ml-9 mb-[15px] flex flex-wrap gap-2">
          {nonImageLinks.map((link, index) => (
            <Button 
              key={index}
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-xs text-mari-primary-green border-mari-primary-green hover:bg-mari-very-light-green"
              onClick={() => openLink(link)}
            >
              <ExternalLink size={14} />
              Visitar Link
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
