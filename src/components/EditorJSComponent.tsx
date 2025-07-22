import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import Code from "@editorjs/code";
import Checklist from "@editorjs/checklist";
import Delimiter from "@editorjs/delimiter";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

interface EditorJSComponentProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export interface EditorJSRef {
  save: () => Promise<OutputData>;
}

const EditorJSComponent = forwardRef<EditorJSRef, EditorJSComponentProps>(
  ({ data, onChange, placeholder = "Start writing...", readOnly = false }, ref) => {
    const editorRef = useRef<EditorJS | null>(null);
    const holderRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (editorRef.current) {
          try {
            return await editorRef.current.save();
          } catch (error) {
            console.error("Error saving editor data:", error);
            return { time: Date.now(), blocks: [], version: "2.30.8" };
          }
        }
        return { time: Date.now(), blocks: [], version: "2.30.8" };
      }
    }));

    useEffect(() => {
      if (!holderRef.current || isInitialized.current) return;

      const initializeEditor = async () => {
        try {
          const editor = new EditorJS({
            holder: holderRef.current,
            tools: {
              header: {
                class: Header,
                config: {
                  placeholder: "Enter a header",
                  levels: [1, 2, 3, 4, 5, 6],
                  defaultLevel: 1
                },
                shortcut: "CMD+SHIFT+H"
              },
              paragraph: {
                class: Paragraph,
                inlineToolbar: true,
                config: {
                  placeholder: placeholder,
                  preserveBlank: true
                }
              },
              list: {
                class: List,
                inlineToolbar: true,
                config: {
                  defaultStyle: "unordered"
                },
                shortcut: "CMD+SHIFT+L"
              },
              checklist: {
                class: Checklist,
                inlineToolbar: true
              },
              quote: {
                class: Quote,
                inlineToolbar: true,
                config: {
                  quotePlaceholder: "Enter a quote",
                  captionPlaceholder: "Quote's author"
                },
                shortcut: "CMD+SHIFT+O"
              },
              code: {
                class: Code,
                config: {
                  placeholder: "Enter code here..."
                },
                shortcut: "CMD+SHIFT+C"
              },
              delimiter: Delimiter,
              marker: {
                class: Marker,
                shortcut: "CMD+SHIFT+M"
              },
              inlineCode: {
                class: InlineCode,
                shortcut: "CMD+SHIFT+`"
              }
            },
            data: data || {
              time: Date.now(),
              blocks: [
                {
                  type: "paragraph",
                  data: {
                    text: ""
                  }
                }
              ],
              version: "2.30.8"
            },
            onChange: async () => {
              if (onChange && editorRef.current) {
                try {
                  const outputData = await editorRef.current.save();
                  onChange(outputData);
                } catch (error) {
                  console.error("Saving failed:", error);
                }
              }
            },
            placeholder: placeholder,
            readOnly: readOnly,
            minHeight: 200
          });

          await editor.isReady;
          editorRef.current = editor;
          isInitialized.current = true;
        } catch (error) {
          console.error("Failed to initialize Editor.js:", error);
        }
      };

      initializeEditor();

      return () => {
        if (editorRef.current && editorRef.current.destroy) {
          editorRef.current.destroy();
          editorRef.current = null;
          isInitialized.current = false;
        }
      };
    }, []);

    // Update data when prop changes
    useEffect(() => {
      if (editorRef.current && data && isInitialized.current) {
        editorRef.current.render(data).catch(console.error);
      }
    }, [data]);

    return (
      <div className="prose max-w-none">
        <div 
          ref={holderRef} 
          className="min-h-[400px] focus:outline-none"
        />
      </div>
    );
  }
);

EditorJSComponent.displayName = "EditorJSComponent";

export default EditorJSComponent;