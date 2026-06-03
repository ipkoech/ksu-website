"use client";

import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code2,
  Columns3,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Paperclip,
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  Rows3,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink2,
} from "lucide-react";
import { Button, Input } from "../ui";
import { cn } from "../../lib";
import { sanitizeRichText } from "./rich-text-renderer";

export interface RichTextAttachmentUploadResult {
  url: string;
  label?: string;
}

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onTextChange?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  maxHeight?: string;
  resizable?: boolean;
  toolbar?: "full" | "simple";
  characterLimit?: number;
  onImageUpload?: (file: File) => Promise<string>;
  onAttachmentUpload?: (
    file: File,
  ) => Promise<string | RichTextAttachmentUploadResult>;
  attachmentAccept?: string;
  sanitizeOnChange?: boolean;
  className?: string;
  editorId?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ariaInvalid?: boolean;
}

function normalizeHtml(value: string) {
  return value === "<p></p>" ? "" : value;
}

function serializeHtml(value: string, shouldSanitize: boolean) {
  const normalized = normalizeHtml(value);
  return shouldSanitize ? sanitizeRichText(normalized) : normalized;
}

function ToolbarButton({
  label,
  onClick,
  active,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-6 w-px bg-border" aria-hidden />;
}

export function RichTextEditor({
  value,
  onChange,
  onTextChange,
  placeholder = "Write something...",
  disabled = false,
  minHeight = "260px",
  maxHeight,
  resizable = true,
  toolbar = "full",
  characterLimit,
  onImageUpload,
  onAttachmentUpload,
  attachmentAccept,
  sanitizeOnChange = true,
  className,
  editorId,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  ariaInvalid,
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] =
    React.useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const attachmentInputRef = React.useRef<HTMLInputElement>(null);
  const isFullToolbar = toolbar === "full";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextStyle,
      Color.configure({ types: [TextStyle.name] }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        autolink: true,
        defaultProtocol: "https",
        openOnClick: false,
        protocols: ["http", "https", "mailto", "tel"],
      }),
      Image.configure({ allowBase64: false, inline: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount.configure({ limit: characterLimit }),
      Placeholder.configure({ placeholder }),
    ],
    content: serializeHtml(value || "", sanitizeOnChange),
    editable: !disabled,
    editorProps: {
      attributes: {
        ...(editorId ? { id: editorId } : {}),
        role: "textbox",
        "aria-multiline": "true",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        ...(ariaLabelledby ? { "aria-labelledby": ariaLabelledby } : {}),
        ...(ariaDescribedby ? { "aria-describedby": ariaDescribedby } : {}),
        ...(ariaInvalid ? { "aria-invalid": "true" } : {}),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(serializeHtml(currentEditor.getHTML(), sanitizeOnChange));
      onTextChange?.(currentEditor.getText());
    },
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  React.useEffect(() => {
    if (!editor) return;
    const nextValue = serializeHtml(value || "", sanitizeOnChange);
    if (serializeHtml(editor.getHTML(), sanitizeOnChange) !== nextValue) {
      editor.commands.setContent(nextValue, false);
    }
  }, [editor, sanitizeOnChange, value]);

  const applyLink = () => {
    if (!editor) return;
    const href = linkUrl.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkUrl("");
  };

  const applyImageUrl = () => {
    if (!editor) return;
    const src = imageUrl.trim();
    if (!src) return;
    editor.chain().focus().setImage({ src }).run();
    setImageUrl("");
  };

  const uploadImage = async (file: File | undefined) => {
    if (!editor || !file || !onImageUpload) return;
    setIsUploadingImage(true);
    try {
      const src = await onImageUpload(file);
      if (src) editor.chain().focus().setImage({ src }).run();
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const uploadAttachment = async (file: File | undefined) => {
    if (!editor || !file || !onAttachmentUpload) return;
    setIsUploadingAttachment(true);
    try {
      const result = await onAttachmentUpload(file);
      const attachment =
        typeof result === "string" ? { url: result, label: file.name } : result;
      if (!attachment.url) return;

      const selectedText = editor.state.doc
        .textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          " ",
        )
        .trim();
      const label = attachment.label?.trim() || file.name || attachment.url;

      if (selectedText) {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({
            href: attachment.url,
            target: "_blank",
            rel: "noopener noreferrer",
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "paragraph",
            content: [
              {
                type: "text",
                text: label,
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: attachment.url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                  },
                ],
              },
            ],
          })
          .run();
      }
    } finally {
      setIsUploadingAttachment(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    }
  };

  if (!editor) return null;

  const wordCount = editor.storage.characterCount.words();
  const characterCount = editor.storage.characterCount.characters();
  const editorAreaStyle = {
    minHeight,
    maxHeight,
    "--rich-text-min-height": minHeight,
  } as React.CSSProperties;

  return (
    <div className={cn("rounded-lg border bg-background", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
        <ToolbarButton
          label="Paragraph"
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          disabled={disabled}
        >
          <Pilcrow className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          disabled={disabled}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          disabled={disabled}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          disabled={disabled}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          disabled={disabled}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          disabled={disabled}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        {isFullToolbar ? (
          <>
            <ToolbarButton
              label="Subscript"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              active={editor.isActive("subscript")}
              disabled={disabled}
            >
              <SubscriptIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Superscript"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              active={editor.isActive("superscript")}
              disabled={disabled}
            >
              <SuperscriptIcon className="h-4 w-4" />
            </ToolbarButton>
          </>
        ) : null}
        <ToolbarDivider />
        <label
          className={cn(
            "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-sm transition hover:bg-accent hover:text-accent-foreground",
            disabled && "pointer-events-none opacity-50",
          )}
          title="Text color"
          aria-label="Text color"
        >
          <Palette className="h-4 w-4" />
          <input
            type="color"
            className="sr-only"
            disabled={disabled}
            onInput={(event) =>
              editor
                .chain()
                .focus()
                .setColor((event.target as HTMLInputElement).value)
                .run()
            }
          />
        </label>
        <label
          className={cn(
            "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-sm transition hover:bg-accent hover:text-accent-foreground",
            disabled && "pointer-events-none opacity-50",
          )}
          title="Highlight color"
          aria-label="Highlight color"
        >
          <Highlighter className="h-4 w-4" />
          <input
            type="color"
            className="sr-only"
            disabled={disabled}
            defaultValue="#fff3a3"
            onInput={(event) =>
              editor
                .chain()
                .focus()
                .toggleHighlight({
                  color: (event.target as HTMLInputElement).value,
                })
                .run()
            }
          />
        </label>
        <ToolbarButton
          label="Clear formatting"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          disabled={disabled}
        >
          <Eraser className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/20 p-2">
        <ToolbarButton
          label="Align left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          disabled={disabled}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          disabled={disabled}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          disabled={disabled}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Justify"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          disabled={disabled}
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          label="Bulleted list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          disabled={disabled}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          disabled={disabled}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Task list"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive("taskList")}
          disabled={disabled}
        >
          <CheckSquare className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          disabled={disabled}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        {isFullToolbar ? (
          <ToolbarButton
            label="Code block"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            disabled={disabled}
          >
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
        ) : null}
        <ToolbarButton
          label="Horizontal line"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b p-2">
        <Input
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          placeholder="https://example.com"
          className="h-11 min-w-[180px] max-w-xs flex-1"
          disabled={disabled}
          aria-label="Link URL"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={applyLink}
          disabled={disabled}
        >
          <Link2 className="h-4 w-4" />
          Link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
          disabled={disabled || !editor.isActive("link")}
        >
          <Unlink2 className="h-4 w-4" />
          Unlink
        </Button>
        {onAttachmentUpload ? (
          <>
            <input
              ref={attachmentInputRef}
              type="file"
              accept={attachmentAccept}
              className="hidden"
              disabled={disabled || isUploadingAttachment}
              onChange={(event) =>
                void uploadAttachment(event.target.files?.[0])
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => attachmentInputRef.current?.click()}
              disabled={disabled || isUploadingAttachment}
            >
              <Paperclip className="h-4 w-4" />
              {isUploadingAttachment ? "Attaching" : "Attach"}
            </Button>
          </>
        ) : null}
        {isFullToolbar ? (
          <>
            <Input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="Image URL"
              className="h-11 min-w-[180px] max-w-xs flex-1"
              disabled={disabled}
              aria-label="Image URL"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyImageUrl}
              disabled={disabled || !imageUrl.trim()}
            >
              <ImagePlus className="h-4 w-4" />
              Image
            </Button>
            {onImageUpload ? (
              <>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={disabled || isUploadingImage}
                  onChange={(event) =>
                    void uploadImage(event.target.files?.[0])
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={disabled || isUploadingImage}
                >
                  <ImagePlus className="h-4 w-4" />
                  {isUploadingImage ? "Uploading" : "Upload"}
                </Button>
              </>
            ) : null}
          </>
        ) : null}
      </div>

      {isFullToolbar ? (
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/20 p-2">
          <ToolbarButton
            label="Insert table"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            disabled={disabled}
          >
            <Table2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Add row"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={disabled || !editor.can().addRowAfter()}
          >
            <Rows3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Add column"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={disabled || !editor.can().addColumnAfter()}
          >
            <Columns3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Delete row"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={disabled || !editor.can().deleteRow()}
          >
            <Trash2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Delete column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={disabled || !editor.can().deleteColumn()}
          >
            <Trash2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={disabled || !editor.can().deleteTable()}
          >
            <Trash2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      ) : null}

      <div
        className={cn(
          "min-w-0 overflow-auto",
          resizable && !disabled && "resize-y",
        )}
        style={editorAreaStyle}
      >
        <EditorContent
          editor={editor}
          className={cn(
            "rich-text-editor prose prose-sm max-w-none [&_.ProseMirror]:min-h-[var(--rich-text-min-height)] [&_.ProseMirror]:outline-none [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:p-3",
            disabled && "opacity-70",
          )}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        <span>{wordCount} words</span>
        <span>
          {characterCount}
          {characterLimit ? `/${characterLimit}` : ""} characters
        </span>
      </div>
    </div>
  );
}
