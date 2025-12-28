'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageBlock } from '@/lib/models/Content';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';

interface PageBlockEditorProps {
  block: PageBlock;
  onSave: (content: any) => void;
  onCancel: () => void;
}

export default function PageBlockEditor({ block, onSave, onCancel }: PageBlockEditorProps) {
  const [content, setContent] = useState(block.content);

  useEffect(() => {
    setContent(block.content);
  }, [block]);

  const handleSave = () => {
    onSave(content);
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={content.title || ''}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                placeholder="Section title"
              />
            </div>
            <div>
              <Label>Content</Label>
              <RichTextEditor
                value={content.text || ''}
                onChange={(text) => setContent({ ...content, text })}
              />
            </div>
            <div>
              <Label>Alignment</Label>
              <select
                value={content.align || 'left'}
                onChange={(e) => setContent({ ...content, align: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={content.title || ''}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={content.subtitle || ''}
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Background Image</Label>
              <ImageUpload
                value={content.backgroundImage || ''}
                onChange={(url) => setContent({ ...content, backgroundImage: url })}
                label=""
                aspectRatio={16 / 9}
                showEditButton={true}
              />
              <div className="mt-2">
                <Label className="text-sm text-gray-600">Or enter image URL:</Label>
                <Input
                  value={content.backgroundImage || ''}
                  onChange={(e) => setContent({ ...content, backgroundImage: e.target.value })}
                  placeholder="/images/hero-bg.jpg or https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Overlay Opacity: {content.overlayOpacity !== undefined ? content.overlayOpacity : 50}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={content.overlayOpacity !== undefined ? content.overlayOpacity : 50}
                onChange={(e) => setContent({ ...content, overlayOpacity: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0% (No overlay)</span>
                <span>100% (Full black)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CTA Button Text</Label>
                <Input
                  value={content.ctaText || ''}
                  onChange={(e) => setContent({ ...content, ctaText: e.target.value })}
                />
              </div>
              <div>
                <Label>CTA Button Link</Label>
                <Input
                  value={content.ctaLink || ''}
                  onChange={(e) => setContent({ ...content, ctaLink: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Button Background Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={content.buttonBackgroundColor || '#000000'}
                    onChange={(e) => setContent({ ...content, buttonBackgroundColor: e.target.value })}
                    className="w-20 h-10 cursor-pointer rounded border"
                  />
                  <Input
                    value={content.buttonBackgroundColor || '#000000'}
                    onChange={(e) => setContent({ ...content, buttonBackgroundColor: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <Label>Button Text Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={content.buttonTextColor || '#ffffff'}
                    onChange={(e) => setContent({ ...content, buttonTextColor: e.target.value })}
                    className="w-20 h-10 cursor-pointer rounded border"
                  />
                  <Input
                    value={content.buttonTextColor || '#ffffff'}
                    onChange={(e) => setContent({ ...content, buttonTextColor: e.target.value })}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <Label>Section Title</Label>
              <Input
                value={content.title || ''}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Card Width</Label>
              <select
                value={content.cardWidth || 'auto'}
                onChange={(e) => setContent({ ...content, cardWidth: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="auto">Auto (1/3 width on desktop)</option>
                <option value="sm">Small (280px)</option>
                <option value="md">Medium (320px)</option>
                <option value="lg">Large (400px)</option>
                <option value="xl">Extra Large (500px)</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            <div>
              <Label>Cards</Label>
              {(content.cards || []).map((card: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Card {index + 1}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCards = [...(content.cards || [])];
                        newCards.splice(index, 1);
                        setContent({ ...content, cards: newCards });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Card title"
                      value={card.title || ''}
                      onChange={(e) => {
                        const newCards = [...(content.cards || [])];
                        newCards[index] = { ...card, title: e.target.value };
                        setContent({ ...content, cards: newCards });
                      }}
                    />
                    <Textarea
                      placeholder="Card description"
                      value={card.description || ''}
                      onChange={(e) => {
                        const newCards = [...(content.cards || [])];
                        newCards[index] = { ...card, description: e.target.value };
                        setContent({ ...content, cards: newCards });
                      }}
                      rows={2}
                    />
                    <Input
                      placeholder="Image URL"
                      value={card.image || ''}
                      onChange={(e) => {
                        const newCards = [...(content.cards || [])];
                        newCards[index] = { ...card, image: e.target.value };
                        setContent({ ...content, cards: newCards });
                      }}
                    />
                    <Input
                      placeholder="Link URL (optional)"
                      value={card.link || ''}
                      onChange={(e) => {
                        const newCards = [...(content.cards || [])];
                        newCards[index] = { ...card, link: e.target.value };
                        setContent({ ...content, cards: newCards });
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setContent({
                    ...content,
                    cards: [...(content.cards || []), { title: '', description: '', image: '', link: '' }]
                  });
                }}
              >
                Add Card
              </Button>
            </div>
          </div>
        );

      case 'columns':
        return (
          <div className="space-y-4">
            {(content.columns || []).map((column: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <Label>Column {index + 1}</Label>
                <div className="space-y-2 mt-2">
                  <Input
                    placeholder="Column title"
                    value={column.title || ''}
                    onChange={(e) => {
                      const newColumns = [...(content.columns || [])];
                      newColumns[index] = { ...column, title: e.target.value };
                      setContent({ ...content, columns: newColumns });
                    }}
                  />
                  <Textarea
                    placeholder="Column content"
                    value={column.content || ''}
                    onChange={(e) => {
                      const newColumns = [...(content.columns || [])];
                      newColumns[index] = { ...column, content: e.target.value };
                      setContent({ ...content, columns: newColumns });
                    }}
                    rows={4}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setContent({
                    ...content,
                    columns: [...(content.columns || []), { title: '', content: '' }]
                  });
                }}
              >
                Add Column
              </Button>
              {(content.columns || []).length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newColumns = [...(content.columns || [])];
                    newColumns.pop();
                    setContent({ ...content, columns: newColumns });
                  }}
                >
                  Remove Column
                </Button>
              )}
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                value={content.image || ''}
                onChange={(e) => setContent({ ...content, image: e.target.value })}
                placeholder="/images/example.jpg"
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input
                value={content.alt || ''}
                onChange={(e) => setContent({ ...content, alt: e.target.value })}
                placeholder="Description of image"
              />
            </div>
            <div>
              <Label>Caption</Label>
              <Input
                value={content.caption || ''}
                onChange={(e) => setContent({ ...content, caption: e.target.value })}
                placeholder="Optional caption"
              />
            </div>
            <div>
              <Label>Alignment</Label>
              <select
                value={content.align || 'center'}
                onChange={(e) => setContent({ ...content, align: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={content.title || ''}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Text</Label>
              <Textarea
                value={content.text || ''}
                onChange={(e) => setContent({ ...content, text: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Button Text</Label>
                <Input
                  value={content.buttonText || ''}
                  onChange={(e) => setContent({ ...content, buttonText: e.target.value })}
                />
              </div>
              <div>
                <Label>Button Link</Label>
                <Input
                  value={content.buttonLink || ''}
                  onChange={(e) => setContent({ ...content, buttonLink: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Background Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={content.backgroundColor || '#1e40af'}
                  onChange={(e) => setContent({ ...content, backgroundColor: e.target.value })}
                  className="w-20 h-10 cursor-pointer rounded border"
                />
                <Input
                  value={content.backgroundColor || '#1e40af'}
                  onChange={(e) => setContent({ ...content, backgroundColor: e.target.value })}
                  placeholder="#1e40af"
                />
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <h4 className="font-medium mb-4 capitalize">{block.type} Block Editor</h4>
        {renderEditor()}
      </div>
      <div className="flex gap-2 pt-4 border-t">
        <Button type="button" onClick={handleSave}>
          Save Block
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

