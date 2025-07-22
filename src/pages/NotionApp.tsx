import { useState, useRef } from "react";
import { OutputData } from "@editorjs/editorjs";
import { NotionSidebar } from "@/components/NotionSidebar";
import EditorJSComponent, { EditorJSRef } from "@/components/EditorJSComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Share2, MoreHorizontal, Edit3 } from "lucide-react";

interface Page {
  id: string;
  title: string;
  icon?: string;
  editorData: OutputData;
  children?: Page[];
}

const initialPages: Page[] = [
  {
    id: "1",
    title: "Getting Started",
    icon: "🚀",
    editorData: {
      time: Date.now(),
      blocks: [
        {
          type: "header",
          data: {
            text: "Welcome to Your Notion Workspace",
            level: 1
          }
        },
        {
          type: "paragraph",
          data: {
            text: "This is your personal workspace where you can organize thoughts, write notes, and manage projects. Start by creating new pages or editing this one."
          }
        },
        {
          type: "header",
          data: {
            text: "Getting Started",
            level: 2
          }
        },
        {
          type: "list",
          data: {
            style: "unordered",
            items: [
              "Click anywhere to start editing",
              "Use different block types like headings, lists, and paragraphs",
              "Create new pages from the sidebar"
            ]
          }
        }
      ],
      version: "2.30.8"
    }
  },
  {
    id: "2",
    title: "Quick Notes",
    icon: "📝",
    editorData: {
      time: Date.now(),
      blocks: [
        {
          type: "header",
          data: {
            text: "Quick Notes",
            level: 1
          }
        },
        {
          type: "paragraph",
          data: {
            text: "Capture your thoughts here..."
          }
        }
      ],
      version: "2.30.8"
    }
  }
];

export function NotionApp() {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [activePage, setActivePage] = useState("1");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const editorRef = useRef<EditorJSRef>(null);

  const currentPage = pages.find(p => p.id === activePage);

  const createNewPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: "Untitled",
      icon: "📄",
      editorData: {
        time: Date.now(),
        blocks: [
          {
            type: "header",
            data: {
              text: "",
              level: 1
            }
          }
        ],
        version: "2.30.8"
      }
    };
    
    setPages([...pages, newPage]);
    setActivePage(newPage.id);
  };

  const updatePageData = (editorData: OutputData) => {
    setPages(pages.map(page => 
      page.id === activePage ? { ...page, editorData } : page
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
        <div className="flex-1 overflow-y-auto p-8">
          <EditorJSComponent
            ref={editorRef}
            data={currentPage.editorData}
            onChange={updatePageData}
            placeholder="Start writing..."
          />
        </div>
      </div>
    </div>
  );
}