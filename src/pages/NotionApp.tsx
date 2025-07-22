import { useState } from "react";
import { NotionSidebar } from "@/components/NotionSidebar";
import { BlockEditor, Block } from "@/components/BlockEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Share2, MoreHorizontal, Edit3 } from "lucide-react";

interface Page {
  id: string;
  title: string;
  icon?: string;
  blocks: Block[];
  children?: Page[];
}

const initialPages: Page[] = [
  {
    id: "1",
    title: "Getting Started",
    icon: "🚀",
    blocks: [
      {
        id: "1-1",
        type: "heading1",
        content: "Welcome to Your Notion Workspace"
      },
      {
        id: "1-2",
        type: "paragraph",
        content: "This is your personal workspace where you can organize thoughts, write notes, and manage projects. Start by creating new pages or editing this one."
      },
      {
        id: "1-3",
        type: "heading2",
        content: "Getting Started"
      },
      {
        id: "1-4",
        type: "bullet-list",
        content: "Click the + button to add new blocks"
      },
      {
        id: "1-5",
        type: "bullet-list",
        content: "Use different block types like headings, lists, and paragraphs"
      },
      {
        id: "1-6",
        type: "bullet-list",
        content: "Create new pages from the sidebar"
      }
    ]
  },
  {
    id: "2",
    title: "Quick Notes",
    icon: "📝",
    blocks: [
      {
        id: "2-1",
        type: "heading1",
        content: "Quick Notes"
      },
      {
        id: "2-2",
        type: "paragraph",
        content: "Capture your thoughts here..."
      }
    ]
  }
];

export function NotionApp() {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [activePage, setActivePage] = useState("1");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const currentPage = pages.find(p => p.id === activePage);

  const createNewPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: "Untitled",
      icon: "📄",
      blocks: [
        {
          id: `${Date.now()}-1`,
          type: "heading1",
          content: ""
        }
      ]
    };
    
    setPages([...pages, newPage]);
    setActivePage(newPage.id);
  };

  const updatePageBlocks = (blocks: Block[]) => {
    setPages(pages.map(page => 
      page.id === activePage ? { ...page, blocks } : page
    ));
  };

  const updatePageTitle = (newTitle: string) => {
    setPages(pages.map(page => 
      page.id === activePage ? { ...page, title: newTitle } : page
    ));
    setIsEditingTitle(false);
  };

  const startEditingTitle = () => {
    if (currentPage) {
      setTempTitle(currentPage.title);
      setIsEditingTitle(true);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      updatePageTitle(tempTitle);
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
    }
  };

  if (!currentPage) return null;

  return (
    <div className="flex h-screen bg-background">
      <NotionSidebar
        pages={pages}
        activePage={activePage}
        onPageSelect={setActivePage}
        onCreatePage={createNewPage}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentPage.icon}</span>
            {isEditingTitle ? (
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => updatePageTitle(tempTitle)}
                onKeyDown={handleTitleKeyDown}
                className="text-xl font-semibold border-none p-0 focus-visible:ring-0 bg-transparent"
                autoFocus
              />
            ) : (
              <h1 
                className="text-xl font-semibold text-notion-text cursor-pointer hover:bg-notion-hover px-2 py-1 rounded"
                onClick={startEditingTitle}
              >
                {currentPage.title}
              </h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={startEditingTitle}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          <BlockEditor
            blocks={currentPage.blocks}
            onBlocksChange={updatePageBlocks}
            placeholder="Start writing..."
          />
        </div>
      </div>
    </div>
  );
}