"use client";
import { DocumentApi } from "@/api/documentApi";
import { AddDocumentBtn } from "@/components/AddDocumentBtn";
import { Header } from "@/components/layout/Header";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { DocumentType } from "@/types";
import { UserSettingButton } from "@/components/layout/UserSetting";
import { dateConverter } from "@/lib/utils";
import { DeleteModal } from "@/components/DeleteModal";
import AuthContext from "@/context/AuthContext";
import { useContext } from "react";

export default function Home() {
  const { user } = useContext(AuthContext);
  const {
    data: documents,
    isPending,
    error,
  } = useQuery({
    queryKey: ["documents"],
    queryFn: () => DocumentApi().GetList(),
    refetchInterval: 1000,
  });
  return (
    <main className=" home-container">
      <Header>
        <UserSettingButton />
      </Header>
      {isPending ? (
        <p className=" absolute translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%]">
          Loading...
        </p>
      ) : error ? (
        <p className=" absolute translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%]">
          {error.message}
        </p>
      ) : documents!.data.length > 0 ? (
        <div className="document-list-container">
          <div className="document-list-title">
            <h3 className="text-28-semibold">All documents</h3>
            <AddDocumentBtn />
          </div>
          <ul className="document-ul">
            {documents!.data.map((document: DocumentType) => (
              <li key={document.id} className="document-list-item">
                <Link
                  href={`/documents/${document.id}`}
                  className=" flex flex-1 items-center gap-4"
                >
                  <div className="hidden rounded-md bg-dark-500 p-2 sm:block">
                    <Image
                      src={"/assets/icons/doc.svg"}
                      alt="file"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className=" space-y-1">
                    <p className=" line-clamp-1 text-lg">{document.title}</p>
                    <p className=" text-sm font-light text-blue-100">
                      Created about {dateConverter(document.created_at)}
                    </p>
                  </div>
                </Link>
                {user && user.user == document.author_id && (
                  <DeleteModal roomId={document.id} />
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="document-list-empty">
          <Image
            src="/assets/icons/doc.svg"
            alt="Document"
            width={40}
            height={40}
          />
          <AddDocumentBtn />
        </div>
      )}
    </main>
  );
}
