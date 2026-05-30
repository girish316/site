"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Bold, Italic, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link2, Image as ImageIcon,
  AlignLeft, Code2, Undo, Redo
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichEditorProps {
  content: string;
  contentType: "html" | "markdown";
  onChange: (content: string, type: "html" | "markdown") => void;
  placeholder?: string;
}

function escapeMarkdown(text: string) {
  return text;
}

function inlineNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeMarkdown(node.textContent ?? "");
  if (!(node instanceof HTMLElement)) return "";

  const inner = Array.from(node.childNodes).map(inlineNodeToMarkdown).join("");

  switch (node.tagName.toLowerCase()) {
    case "strong":
    case "b":
      return inner ? `**${inner}**` : "";
    case "em":
    case "i":
      return inner ? `*${inner}*` : "";
    case "code":
      return `\`${(node.textContent ?? "").replace(/`/g, "\\`")}\``;
    case "a": {
      const href = node.getAttribute("href");
      return href ? `[${inner || href}](${href})` : inner;
    }
    case "img": {
      const src = node.getAttribute("src") ?? "";
      const alt = node.getAttribute("alt") ?? "";
      return src ? `![${escapeMarkdown(alt)}](${src})` : "";
    }
    case "br":
      return "\n";
    default:
      return inner;
  }
}

function blockNodeToMarkdown(node: Node, listDepth = 0): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeMarkdown(node.textContent ?? "");
  if (!(node instanceof HTMLElement)) return "";

  const tag = node.tagName.toLowerCase();
  const inline = () => Array.from(node.childNodes).map(inlineNodeToMarkdown).join("").trim();

  if (/^h[1-6]$/.test(tag)) {
    return `${"#".repeat(Number(tag[1]))} ${inline()}\n\n`;
  }

  if (tag === "p") {
    const text = inline();
    return text ? `${text}\n\n` : "";
  }

  if (tag === "blockquote") {
    const text = Array.from(node.childNodes)
      .map(child => blockNodeToMarkdown(child, listDepth).trim())
      .join("\n")
      .split("\n")
      .map(line => `> ${line}`)
      .join("\n");
    return `${text}\n\n`;
  }

  if (tag === "pre") {
    return `\`\`\`\n${node.textContent ?? ""}\n\`\`\`\n\n`;
  }

  if (tag === "hr") return "---\n\n";

  if (tag === "ul" || tag === "ol") {
    const items = Array.from(node.children).filter(child => child.tagName.toLowerCase() === "li");
    return items.map((li, index) => {
      const prefix = tag === "ol" ? `${index + 1}. ` : "- ";
      const indent = "  ".repeat(listDepth);
      const directText = Array.from(li.childNodes)
        .filter(child => !(child instanceof HTMLElement && ["ul", "ol"].includes(child.tagName.toLowerCase())))
        .map(inlineNodeToMarkdown)
        .join("")
        .trim();
      const nested = Array.from(li.children)
        .filter(child => ["ul", "ol"].includes(child.tagName.toLowerCase()))
        .map(child => blockNodeToMarkdown(child, listDepth + 1).trimEnd())
        .join("\n");
      return `${indent}${prefix}${directText}${nested ? `\n${nested}` : ""}`;
    }).join("\n") + "\n\n";
  }

  if (tag === "li") return `${inline()}\n`;

  return Array.from(node.childNodes).map(child => blockNodeToMarkdown(child, listDepth)).join("");
}

function htmlToMarkdown(html: string): string {
  if (typeof document === "undefined") return html;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html ?? "";

  return Array.from(wrapper.childNodes)
    .map(child => blockNodeToMarkdown(child))
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function markdownToHtml(markdown: string): string {
  const escapeHtml = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inline = (text: string) => escapeHtml(text)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) html.push(`</${listType}>`);
    listType = null;
  };

  for (const line of lines) {
    if (!line.trim()) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      if (listType !== "ul") { closeList(); html.push("<ul>"); listType = "ul"; }
      html.push(`<li>${inline(unordered[1])}</li>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      if (listType !== "ol") { closeList(); html.push("<ol>"); listType = "ol"; }
      html.push(`<li>${inline(ordered[1])}</li>`);
      continue;
    }

    if (line.startsWith("> ")) {
      closeList();
      html.push(`<blockquote><p>${inline(line.slice(2))}</p></blockquote>`);
      continue;
    }

    if (line.trim() === "---") {
      closeList();
      html.push("<hr />");
      continue;
    }

    closeList();
    html.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  return html.join("");
}

export default function RichEditor({ content, contentType, onChange, placeholder = "Start writing..." }: RichEditorProps) {
  const [mode, setMode] = useState<"rich" | "markdown">(contentType === "markdown" ? "markdown" : "rich");
  const [markdownContent, setMarkdownContent] = useState(contentType === "markdown" ? content : "");
  const lastSyncedContentRef = useRef<string>(content ?? "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: contentType === "html" ? content : markdownToHtml(content ?? ""),
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), "html");
    },
  });

  // Tiptap only uses the initial `content` prop when the editor is created.
  // When a saved draft is loaded from Firestore after the page renders,
  // push the loaded content into the correct editor mode manually.
  useEffect(() => {
    const nextContent = content ?? "";
    if (lastSyncedContentRef.current === nextContent) return;

    lastSyncedContentRef.current = nextContent;

    if (contentType === "markdown") {
      setMode("markdown");
      setMarkdownContent(nextContent);
      return;
    }

    setMode("rich");
    if (editor && editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent || "", false);
    }
  }, [content, contentType, editor]);

  const switchMode = (nextMode: "rich" | "markdown") => {
    if (nextMode === mode) return;

    if (nextMode === "markdown") {
      const html = editor?.getHTML() ?? content ?? "";
      const markdown = htmlToMarkdown(html);
      setMarkdownContent(markdown);
      onChange(markdown, "markdown");
      lastSyncedContentRef.current = markdown;
      setMode("markdown");
      return;
    }

    const html = markdownToHtml(markdownContent);
    editor?.commands.setContent(html, false);
    onChange(html, "html");
    lastSyncedContentRef.current = html;
    setMode("rich");
  };

  const handleMarkdownChange = (val: string) => {
    setMarkdownContent(val);
    onChange(val, "markdown");
    lastSyncedContentRef.current = val;
  };

  const addLink = useCallback(() => {
    const url = prompt("Enter URL");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = prompt("Enter image URL");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="tiptap-editor border border-surface-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-surface-200 bg-surface-50 flex-wrap">

        {/* Mode toggle */}
        <div className="flex rounded-lg overflow-hidden border border-surface-200 mr-3">
          {(["rich","markdown"] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={cn(
                "px-3 py-1 text-xs font-mono transition-colors",
                mode === m ? "bg-brand-600 text-white" : "bg-white text-slate-500 hover:bg-surface-100"
              )}
            >
              {m === "rich" ? <><AlignLeft size={12} className="inline mr-1" />Rich</> : <><Code2 size={12} className="inline mr-1" />Markdown</>}
            </button>
          ))}
        </div>

        {mode === "rich" && editor && (
          <>
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={14}/></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={14}/></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code"><Code size={14}/></ToolBtn>
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({level:1}).run()} active={editor.isActive("heading",{level:1})} title="H1"><Heading1 size={14}/></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} active={editor.isActive("heading",{level:2})} title="H2"><Heading2 size={14}/></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({level:3}).run()} active={editor.isActive("heading",{level:3})} title="H3"><Heading3 size={14}/></ToolBtn>
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List size={14}/></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list"><ListOrdered size={14}/></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><Quote size={14}/></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={14}/></ToolBtn>
            <Divider />
            <ToolBtn onClick={addLink} active={editor.isActive("link")} title="Add link"><Link2 size={14}/></ToolBtn>
            <ToolBtn onClick={addImage} title="Add image"><ImageIcon size={14}/></ToolBtn>
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={14}/></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={14}/></ToolBtn>
          </>
        )}
      </div>

      {/* Editor area */}
      {mode === "rich" ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={markdownContent}
          onChange={e => handleMarkdownChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[420px] p-6 font-mono text-sm text-slate-800 resize-y outline-none bg-white leading-relaxed"
          spellCheck={false}
        />
      )}
    </div>
  );
}

function ToolBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors",
        active ? "bg-brand-100 text-brand-700" : "text-slate-500 hover:bg-surface-200 hover:text-slate-800"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-surface-200 mx-1" />;
}
