import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface SimpleEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function SimpleEditor({ content, onChange, placeholder = "Start writing..." }: SimpleEditorProps) {
  return (
    <div className="w-full h-full">
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-96 border-none resize-none focus-visible:ring-0 text-base"
      />
    </div>
  );
}