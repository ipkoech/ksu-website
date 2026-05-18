"use client";

import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  ImagePlus,
  Code2,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button, Input } from "../ui";
import { cn } from "../../lib";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

function ToolbarButton({
  onClick,
  active,
  children,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button type="button" variant={active ? "secondary" : "ghost"} size="icon-sm" onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  disabled = false,
  minHeight = "240px",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = React.useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b p-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} disabled={disabled}><Bold className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} disabled={disabled}><Italic className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} disabled={disabled}><UnderlineIcon className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} disabled={disabled}><Strikethrough className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} disabled={disabled}><Heading1 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} disabled={disabled}><Heading2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} disabled={disabled}><Heading3 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} disabled={disabled}><List className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} disabled={disabled}><ListOrdered className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} disabled={disabled}><Code2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} disabled={disabled}><Quote className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={disabled || !editor.can().undo()}><Undo2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={disabled || !editor.can().redo()}><Redo2 className="h-4 w-4" /></ToolbarButton>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b p-2">
        <Input
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          placeholder="https://example.com"
          className="max-w-xs"
          disabled={disabled}
        />
        <Button type="button" variant="outline" onClick={() => editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()} disabled={disabled || !linkUrl}>
          <Link2 className="h-4 w-4" />
          Add link
        </Button>
        <Button type="button" variant="outline" onClick={() => editor.chain().focus().setImage({ src: linkUrl }).run()} disabled={disabled || !linkUrl}>
          <ImagePlus className="h-4 w-4" />
          Add image
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:p-3",
          disabled && "opacity-70"
        )}
        style={{ minHeight }}
      />
    </div>
  );
}
