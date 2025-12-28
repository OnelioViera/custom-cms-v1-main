'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageBlock } from '@/lib/models/Content';

interface PageBlockRendererProps {
  blocks: PageBlock[];
}

export default function PageBlockRenderer({ blocks }: PageBlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const sortedBlocks = blocks.sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedBlocks.map((block, index) => {
        const prevBlock = index > 0 ? sortedBlocks[index - 1] : null;
        const isLast = index === sortedBlocks.length - 1;
        return (
          <div key={block.id}>
            {renderBlock(block, isLast, prevBlock?.type)}
          </div>
        );
      })}
    </>
  );
}

function renderBlock(block: PageBlock, isLast: boolean, prevBlockType?: string) {
  switch (block.type) {
    case 'text':
      return (
        <section className={`py-8 ${getTextAlign(block.content.align)}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {block.content.title && (
              <h2 className="text-3xl font-bold mb-4">{block.content.title}</h2>
            )}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        </section>
      );

    case 'hero':
      const bgImageUrl = block.content.backgroundImage;
      const overlayOpacity = block.content.overlayOpacity !== undefined ? block.content.overlayOpacity : 50;
      // Ensure proper URL format - handle both relative and absolute URLs
      const imageUrl = bgImageUrl?.trim() 
        ? (bgImageUrl.startsWith('http') || bgImageUrl.startsWith('/') 
            ? bgImageUrl 
            : `/${bgImageUrl}`)
        : null;
      
      return (
        <section 
          className={`relative text-white ${isLast ? 'py-20' : 'pt-20 pb-0'}`}
          style={{
            backgroundColor: '#1e40af', // Fallback color
            minHeight: '400px', // Ensure minimum height for background to show
          }}
        >
          {imageUrl && (
            <>
              {/* Background image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url("${imageUrl}")`,
                  zIndex: 1,
                }}
              />
              {/* Overlay with adjustable opacity */}
              {overlayOpacity > 0 && (
                <div 
                  className="absolute inset-0 bg-black"
                  style={{ 
                    opacity: overlayOpacity / 100,
                    zIndex: 2,
                  }}
                />
              )}
            </>
          )}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-20" style={{ zIndex: 3 }}>
            {block.content.title && (
              <h1 className="text-5xl font-bold mb-4">{block.content.title}</h1>
            )}
            {block.content.subtitle && (
              <p className="text-xl mb-8">{block.content.subtitle}</p>
            )}
            {block.content.ctaText && block.content.ctaLink && (
              <Link href={block.content.ctaLink}>
                <Button 
                  size="lg"
                  style={{
                    backgroundColor: block.content.buttonBackgroundColor || '#000000',
                    color: block.content.buttonTextColor || '#ffffff',
                  }}
                  className="hover:opacity-90 transition-opacity"
                >
                  {block.content.ctaText}
                </Button>
              </Link>
            )}
          </div>
        </section>
      );

    case 'card':
      const cardTopPadding = prevBlockType === 'hero' ? 'pt-16' : 'pt-12';
      const getCardWidthClass = (width: string) => {
        switch (width) {
          case 'sm':
            return 'w-full md:w-[280px]';
          case 'md':
            return 'w-full md:w-[320px]';
          case 'lg':
            return 'w-full md:w-[400px]';
          case 'xl':
            return 'w-full md:w-[500px]';
          case 'full':
            return 'w-full';
          case 'auto':
          default:
            return 'w-full md:w-[calc(33.333%-1rem)] max-w-sm';
        }
      };
      const cardWidthClass = getCardWidthClass(block.content.cardWidth || 'auto');
      return (
        <section className={`${cardTopPadding} pb-12 bg-gray-50`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {block.content.title && (
              <h2 className="text-3xl font-bold text-center mb-8">{block.content.title}</h2>
            )}
            <div className="flex flex-wrap justify-center gap-6">
              {(block.content.cards || []).map((card: any, index: number) => (
                <div key={index} className={`bg-white rounded-lg shadow-md overflow-hidden ${cardWidthClass}`}>
                  {card.image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={card.image}
                        alt={card.title || 'Card image'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {card.title && (
                      <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                    )}
                    {card.description && (
                      <p className="text-gray-600 mb-4">{card.description}</p>
                    )}
                    {card.link && (
                      <Link href={card.link}>
                        <Button variant="outline">Learn More</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'columns':
      const columnCount = block.content.columns?.length || 2;
      const gridClass = columnCount === 1 ? 'md:grid-cols-1' :
                        columnCount === 2 ? 'md:grid-cols-2' :
                        columnCount === 3 ? 'md:grid-cols-3' :
                        columnCount === 4 ? 'md:grid-cols-4' : 'md:grid-cols-2';
      const columnsTopPadding = prevBlockType === 'hero' ? 'pt-0' : 'pt-12';
      return (
        <section className={`${columnsTopPadding} pb-12`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid ${gridClass} gap-8`}>
              {(block.content.columns || []).map((column: any, index: number) => (
                <div key={index}>
                  {column.title && (
                    <h3 className="text-2xl font-semibold mb-4">{column.title}</h3>
                  )}
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: column.content || '' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'image':
      const imageTopPadding = prevBlockType === 'hero' ? 'pt-0' : 'pt-8';
      return (
        <section className={`${imageTopPadding} pb-8 ${getTextAlign(block.content.align)}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {block.content.image && (
              <div className="relative">
                <div className="relative h-96 w-full">
                  <Image
                    src={block.content.image}
                    alt={block.content.alt || 'Page image'}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                {block.content.caption && (
                  <p className="text-sm text-gray-600 mt-2 text-center italic">
                    {block.content.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      );

    case 'cta':
      const ctaTopPadding = prevBlockType === 'hero' ? 'pt-0' : 'pt-16';
      return (
        <section 
          className={`${ctaTopPadding} pb-16 text-white text-center`}
          style={{ backgroundColor: block.content.backgroundColor || '#1e40af' }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {block.content.title && (
              <h2 className="text-4xl font-bold mb-4">{block.content.title}</h2>
            )}
            {block.content.text && (
              <p className="text-xl mb-8">{block.content.text}</p>
            )}
            {block.content.buttonText && block.content.buttonLink && (
              <Link href={block.content.buttonLink}>
                <Button size="lg" variant="secondary">
                  {block.content.buttonText}
                </Button>
              </Link>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
}

function getTextAlign(align?: string): string {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
}

