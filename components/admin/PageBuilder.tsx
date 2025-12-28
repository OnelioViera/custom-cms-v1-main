'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Trash2, Edit } from 'lucide-react';
import { PageBlock } from '@/lib/models/Content';
import PageBlockEditor from './PageBlockEditor';

interface PageBuilderProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

const STANDARD_BLOCKS = [
  { type: 'text', label: 'Text Section', icon: '📝' },
  { type: 'hero', label: 'Hero Section', icon: '🎯' },
  { type: 'card', label: 'Card Grid', icon: '🃏' },
  { type: 'columns', label: 'Columns Layout', icon: '📊' },
  { type: 'image', label: 'Image Section', icon: '🖼️' },
  { type: 'cta', label: 'Call to Action', icon: '📢' },
];

export default function PageBuilder({ blocks, onChange }: PageBuilderProps) {
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  const addBlock = (type: PageBlock['type']) => {
    const newBlock: PageBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      order: blocks.length,
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: any) => {
    onChange(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
    setEditingBlock(null);
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(block => block.id !== id).map((block, index) => ({
      ...block,
      order: index
    })));
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    onChange(newBlocks.map((block, index) => ({ ...block, order: index })));
  };

  const getDefaultContent = (type: PageBlock['type']): any => {
    switch (type) {
      case 'text':
        return { title: '', text: '', align: 'left' };
      case 'hero':
        return { title: '', subtitle: '', backgroundImage: '', overlayOpacity: 50, ctaText: '', ctaLink: '', buttonBackgroundColor: '#000000', buttonTextColor: '#ffffff' };
      case 'card':
        return { title: '', cardWidth: 'auto', cards: [{ title: '', description: '', image: '', link: '' }] };
      case 'columns':
        return { columns: [{ title: '', content: '' }, { title: '', content: '' }] };
      case 'image':
        return { image: '', alt: '', caption: '', align: 'center' };
      case 'cta':
        return { title: '', text: '', buttonText: '', buttonLink: '', backgroundColor: '#1e40af' };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Page Blocks</h3>
        <div className="flex flex-wrap gap-2">
          {STANDARD_BLOCKS.map((block) => (
            <Button
              key={block.type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock(block.type as PageBlock['type'])}
              className="text-sm"
            >
              <span className="mr-2">{block.icon}</span>
              {block.label}
            </Button>
          ))}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No blocks added yet</p>
          <p className="text-sm text-gray-400">Click on a block type above to add content sections</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks
            .sort((a, b) => a.order - b.order)
            .map((block, index) => (
              <div key={block.id} className="border rounded-lg p-4 bg-gray-50">
                {editingBlock === block.id ? (
                  <PageBlockEditor
                    block={block}
                    onSave={(content) => updateBlock(block.id, content)}
                    onCancel={() => setEditingBlock(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                        <span className="font-medium capitalize">{block.type} Block</span>
                        <span className="text-xs text-gray-500">({index + 1})</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingBlock(block.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBlock(block.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 pl-7">
                      {renderBlockPreview(block)}
                    </div>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => moveBlock(index, index - 1)}
                      >
                        Move Up
                      </Button>
                    )}
                    {index < blocks.length - 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 ml-2 text-xs"
                        onClick={() => moveBlock(index, index + 1)}
                      >
                        Move Down
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function renderBlockPreview(block: PageBlock): string {
  switch (block.type) {
    case 'text':
      return block.content.title || 'Text block (no title)';
    case 'hero':
      return block.content.title || 'Hero block (no title)';
    case 'card':
      return `Card grid with ${block.content.cards?.length || 0} card(s)`;
    case 'columns':
      return `${block.content.columns?.length || 0} column(s)`;
    case 'image':
      return block.content.caption || 'Image block';
    case 'cta':
      return block.content.title || 'Call to Action block';
    default:
      return 'Block';
  }
}

