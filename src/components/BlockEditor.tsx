import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Block {
  id: string;
  type: "heading1" | "heading2" | "heading3" | "paragraph" | "bullet-list" | "numbered-list";
  content: string;
}

interface BlockEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  placeholder?: string;
}

export function BlockEditor({ blocks, onBlocksChange, placeholder = "Start typing..." }: BlockEditorProps) {
  const [focusedBlock, setFocusedBlock] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const editorRefs = useRef<{ [key: string]: HTMLDivElement }>({});

  const updateBlock = (blockId: string, content: string) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, content } : block
    );
    onBlocksChange(updatedBlocks);
  };

  const addBlock = (afterBlockId: string, type: Block["type"] = "paragraph") => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: ""
    };

    const blockIndex = blocks.findIndex(b => b.id === afterBlockId);
    const newBlocks = [...blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);
    onBlocksChange(newBlocks);
    setShowAddMenu(null);

    // Focus the new block
    setTimeout(() => {
      const newBlockEl = editorRefs.current[newBlock.id];
      if (newBlockEl) {
        newBlockEl.focus();
        setFocusedBlock(newBlock.id);
      }
    }, 10);
  };

  const deleteBlock = (blockId: string) => {
    if (blocks.length === 1) return; // Don't delete the last block
    
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const newBlocks = blocks.filter(b => b.id !== blockId);
    onBlocksChange(newBlocks);

    // Focus previous block if it exists
    if (blockIndex > 0) {
      const prevBlock = newBlocks[blockIndex - 1];
      setTimeout(() => {
        const prevBlockEl = editorRefs.current[prevBlock.id];
        if (prevBlockEl) {
          prevBlockEl.focus();
          setFocusedBlock(prevBlock.id);
        }
      }, 10);
    }
  };

  const handleKeyDown = (e: KeyboardEvent, blockId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addBlock(blockId);
    } else if (e.key === "Backspace") {
      const block = blocks.find(b => b.id === blockId);
      if (block && block.content === "" && blocks.length > 1) {
        e.preventDefault();
        deleteBlock(blockId);
      }
    }
  };

  const getBlockStyles = (type: Block["type"]) => {
    switch (type) {
      case "heading1":
        return "text-3xl font-bold text-notion-text leading-tight";
      case "heading2":
        return "text-2xl font-semibold text-notion-text leading-tight";
      case "heading3":
        return "text-xl font-medium text-notion-text leading-tight";
      case "bullet-list":
        return "text-base text-notion-text pl-6 relative before:content-['•'] before:absolute before:left-2";
      case "numbered-list":
        return "text-base text-notion-text pl-6";
      default:
        return "text-base text-notion-text leading-relaxed";
    }
  };

  const getPlaceholder = (type: Block["type"]) => {
    switch (type) {
      case "heading1":
        return "Heading 1";
      case "heading2":
        return "Heading 2";
      case "heading3":
        return "Heading 3";
      case "bullet-list":
        return "List item";
      case "numbered-list":
        return "List item";
      default:
        return placeholder;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="group relative flex items-start gap-2 mb-2"
          onMouseEnter={() => setShowAddMenu(block.id)}
          onMouseLeave={() => setShowAddMenu(null)}
        >
          {/* Drag handle */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-notion-gray" />
            </Button>
          </div>

          {/* Add button */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => addBlock(block.id)}
            >
              <Plus className="h-4 w-4 text-notion-gray" />
            </Button>
          </div>

          {/* Content editable */}
          <div
            ref={(el) => {
              if (el) editorRefs.current[block.id] = el;
            }}
            contentEditable
            suppressContentEditableWarning
            className={cn(
              "flex-1 outline-none min-h-[1.5rem] py-1",
              getBlockStyles(block.type),
              "focus:bg-notion-hover rounded px-1 -mx-1 transition-colors",
              "empty:before:content-[attr(data-placeholder)] empty:before:text-notion-gray"
            )}
            data-placeholder={getPlaceholder(block.type)}
            onInput={(e) => {
              updateBlock(block.id, e.currentTarget.textContent || "");
            }}
            onFocus={() => setFocusedBlock(block.id)}
            onBlur={() => setFocusedBlock(null)}
            onKeyDown={(e) => handleKeyDown(e, block.id)}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      ))}
    </div>
  );
}