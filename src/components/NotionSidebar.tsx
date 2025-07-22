import { useState } from "react";
import { Plus, FileText, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Page {
  id: string;
  title: string;
  icon?: string;
  children?: Page[];
  isExpanded?: boolean;
}

interface NotionSidebarProps {
  pages: Page[];
  activePage: string;
  onPageSelect: (pageId: string) => void;
  onCreatePage: () => void;
}

export function NotionSidebar({ pages, activePage, onPageSelect, onCreatePage }: NotionSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  const toggleExpanded = (pageId: string) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  const renderPage = (page: Page, level = 0) => {
    const isActive = activePage === page.id;
    const hasChildren = page.children && page.children.length > 0;
    const isExpanded = expandedPages.has(page.id);

    return (
      <div key={page.id}>
        <div
          className={cn(
            "group flex items-center gap-1 py-1 px-2 mx-2 rounded cursor-pointer text-sm",
            "hover:bg-notion-hover transition-colors",
            isActive && "bg-notion-light-gray"
          )}
          style={{ paddingLeft: `${8 + level * 16}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(page.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          <div
            className="flex items-center gap-1 flex-1 min-w-0"
            onClick={() => onPageSelect(page.id)}
          >
            <span className="text-notion-text-light">{page.icon || "📄"}</span>
            <span className="truncate text-notion-text">{page.title}</span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {page.children?.map((child) => renderPage(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 h-screen bg-notion-light-gray border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-xs text-primary-foreground font-semibold">N</span>
          </div>
          <span className="font-medium text-notion-text">My Notion</span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-notion-gray" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-background border-none text-sm focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1">
          {filteredPages.map((page) => renderPage(page))}
        </div>
      </div>

      {/* Add Page Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreatePage}
          className="w-full justify-start gap-2 text-notion-text-light hover:bg-notion-hover"
        >
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>
    </div>
  );
}