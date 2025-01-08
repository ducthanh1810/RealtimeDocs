"use client";

import { Editor } from "@/components/editor/Editor";
import { Header } from "./layout/Header";
import { DocumentApi } from "@/api/documentApi";
import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "./ui/input";
import Loader from "./Loader";
import { DocumentType, UserType } from "@/types";
import ShareModal from "./ShareModal";
import AuthContext from "@/context/AuthContext";
import { UserSettingButton } from "./layout/UserSetting";
import { AccessingUser } from "./AccessingUser";

export const CollaborativeRoom = ({
  id,
  currentUserType,
  document,
}: {
  id: string;
  currentUserType: UserType;
  document: DocumentType;
}) => {
  const { mutate: updateTitle } = useMutation({
    mutationFn: DocumentApi().UpdateTitle,
  });

  const { user } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState(document.title);
  const [content] = useState(document.content);
  const [CollaboratorsAccess, setCollaboratorsAccess] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setEditing(false);
      updateTitle({ document_id: id, title: documentTitle });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        editing && updateTitle({ document_id: id, title: documentTitle });
        setEditing(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id, documentTitle]);

  return (
    <main>
      <Header>
        <div ref={containerRef} className="flex items-center gap-x-4">
          {loading ? (
            <h1>Loading...</h1>
          ) : editing && !loading ? (
            <Input
              type="text"
              value={documentTitle}
              ref={inputRef}
              placeholder="Enter title"
              onChange={(e) => setDocumentTitle(e.target.value)}
              onKeyDown={updateTitleHandler}
              disabled={!editing}
              className="document-title-input"
            />
          ) : (
            <h1>{documentTitle}</h1>
          )}
          {currentUserType === "editor" && !editing && (
            <Image
              src="/assets/icons/edit.svg"
              alt="edit"
              width={24}
              height={24}
              onClick={() => setEditing(true)}
              className="pointer"
            />
          )}
          {currentUserType !== "editor" && !editing && (
            <p className="view-only-tag">View only</p>
          )}

          {loading && <p className="text-sm text-gray-400">saving...</p>}
        </div>
        <div className=" flex gap-2 justify-items-center">
          <AccessingUser
            document_id={document.id}
            author_id={document.author_id}
            collaborators={document.collaborators}
            collaboratorsAccessing={CollaboratorsAccess}
          />
          {user && document.author_id == user.user && (
            <ShareModal
              roomId={id}
              collaborators={document.collaborators}
              creatorId={document.author_id}
              user={user}
            />
          )}
          <UserSettingButton />
        </div>
      </Header>
      {loading ? (
        <Loader />
      ) : (
        <Editor
          document_id={id}
          user_id={document.author_id}
          content={content}
          comments={document.comments}
          currentUserType={currentUserType == "viewer" ? false : true}
          setCollaboratorsAccess={setCollaboratorsAccess}
        />
      )}
    </main>
  );
};
