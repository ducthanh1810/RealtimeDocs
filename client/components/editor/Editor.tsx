"use client";

import { $getSelection, $isRangeSelection, EditorState } from "lexical";
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import Theme from "./plugins/Theme";
import { HeadingNode } from "@lexical/rich-text";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import React, { useEffect, useRef, useState } from "react";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { authTokenType, CommentType, UserType, WsType } from "@/types";
import { MyWebSocket } from "@/api/ws";
import { jwtDecode } from "jwt-decode";
import { CommentCreateBox } from "../CommentCreateBox";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "../ui/button";
import { UpdateStatePlugin } from "./UpdateStatePlugin";
import { SetTextComment } from "./SetTextComment";
import { Comment } from "../Comment";
import { set } from "react-hook-form";
import { CommentForm } from "../form/CommentForm";
import { array } from "zod";
import { cn } from "@/lib/utils";

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
export const dynamicParams = false;

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

export function Editor({
  document_id,
  content,
  comments,
  currentUserType,
  setCollaboratorsAccess,
}: {
  document_id: string;
  user_id: number;
  content: string;
  comments: CommentType[];
  currentUserType: boolean;
  setCollaboratorsAccess: (access: string[]) => void;
}) {
  const [documentContent, setDocumentContent] = useState<string>(content);
  const [isMySend, setIsMySend] = useState(true);
  const [lastSend, setLastSend] = useState(Date.now());
  const [ws, setWs] = useState<WsType | null>(null);
  const [enableCreateComment, setEnableCreateComment] = useState(false);
  const [enableCommentBox, setEnableCommentBox] = useState(false);
  const [comment, setComment] = useState<CommentType>();
  const [isSelected, setIsSelected] = useState(false);
  const [chooseText, setChooseText] = useState(false);
  const [locationSelect, setLocationSelect] = useState<any>();
  const [selectionPosition, setSelectionPosition] = useState<{
    y: number;
    x: number;
    mid: number;
  } | null>(null);

  const editAreaRef = useRef<HTMLDivElement>(null);

  const initialConfig = {
    namespace: "Editor",
    nodes: [HeadingNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    editorState:
      documentContent && documentContent.length > 20 ? documentContent : null,
    theme: Theme,
    editable: true,
  };

  useEffect(() => {
    // Create WebSocket connection
    const token: authTokenType = JSON.parse(
      localStorage.getItem("authTokens") || "{}"
    );
    const decoded: { user_id: number } = jwtDecode(token.access);
    const id = decoded.user_id || 0;
    const newWs = MyWebSocket(document_id, id.toString(), token.access);
    setWs(newWs);
    return () => {
      newWs.close();
    };
  }, []);

  useEffect(() => {
    if (ws)
      ws.subscribe(setDocumentContent, setIsMySend, setCollaboratorsAccess);
    return () => {
      ws?.close();
    };
  }, [ws]);

  useEffect(() => {
    try {
      const DateNow = Date.now();
      if (ws && DateNow - lastSend > 20) {
        isMySend ? ws?.push(documentContent) : setIsMySend(true);
        setLastSend(DateNow);
      }
    } catch {}
  }, [documentContent]);

  const onChange = (editorState: EditorState) => {
    try {
      const jsonState = editorState.toJSON();
      setDocumentContent(JSON.stringify(jsonState));
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // const anchorNode = selection.anchor.getNode();
          // const focusNode = selection.focus.getNode();
          const anchorOffset = selection.anchor.offset;
          const focusOffset = selection.focus.offset;
          const keyFocus = selection.focus.key;
          const indexFocus = Array.from(editorState._nodeMap.keys()).indexOf(
            keyFocus
          );

          if (chooseText) {
            editorState._nodeMap.keys().forEach((key, index) => {
              if (key == keyFocus) {
                setLocationSelect(index);
              }
            });
            setEnableCreateComment(true);
          }

          if (anchorOffset !== focusOffset) {
            setIsSelected(true);
            const selectedText = selection.getTextContent();
            // Get selection position
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
              const range = domSelection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              const parentRect = editAreaRef.current!.getBoundingClientRect();
              setSelectionPosition({
                y: rect.bottom - parentRect.top,
                x: rect.left + Math.round(rect.width / 2) - parentRect.left,
                mid: parentRect.width / 2,
              });
            }
          } else {
            setIsSelected(false);
            setEnableCreateComment(false);
            setSelectionPosition(null);
          }
        }
      });
    } catch {}
  };

  const DeleteCommentHandle = (idToDelete: any) => {};

  const SelectionButton = () => {
    if (!isSelected || !selectionPosition || enableCreateComment) return null;

    return (
      <Button
        size={"icon"}
        style={{
          position: "absolute",
          top: `${selectionPosition.y}px`,
          left: `${selectionPosition.x - 20}px`,
        }}
        className="bg-blue-800 text-white px-2 py-1 mt-1 rounded"
        onClick={() => {
          setChooseText(true);
          setTimeout(() => setChooseText(false), 200);
          setIsSelected(false);
        }}
      >
        <MessageSquarePlus />
      </Button>
    );
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full">
        <div
          className={cn(
            "toolbar-wrapper flex min-w-full justify-between",
            !currentUserType && "pointer-events-none"
          )}
        >
          <ToolbarPlugin />
        </div>
        <div className="editor-wrapper flex flex-col items-center justify-start">
          <div
            ref={editAreaRef}
            className={cn(
              "editor-inner min-h-[1100px] relative mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10",
              !currentUserType && "pointer-events-none"
            )}
          >
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="editor-input h-full" />
              }
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <UpdateStatePlugin State={documentContent} />
            <OnChangePlugin onChange={onChange} />
            <SelectionButton />
            <SetTextComment isSetTextComment={chooseText} />
            {enableCreateComment && (
              <CommentCreateBox
                style={{
                  position: "absolute",
                  maxWidth: "300px",
                  top: `${selectionPosition ? selectionPosition!.y + 5 : 0}px`,
                  left: `${
                    selectionPosition ? selectionPosition!.mid - 150 : 0
                  }px`,
                }}
                documentId={document_id}
                location={locationSelect}
                setEnableCommentBox={setEnableCreateComment}
              />
            )}
            {enableCommentBox && comment && (
              <div>
                <p>{comment.content}</p>
              </div>
            )}
          </div>
          <div className=" flex flex-col w-full lg:w-[350px] gap-2">
            <CommentCreateBox documentId={document_id} />
            <Comment documentId={document_id} />
          </div>
        </div>
      </div>
    </LexicalComposer>
  );
}
