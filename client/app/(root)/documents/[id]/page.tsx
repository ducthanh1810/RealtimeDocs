"use client";
import { DocumentApi } from "@/api/documentApi";
import { CollaborativeRoom } from "@/components/CollaborativeRoom";
import Loader from "@/components/Loader";
import { DocumentType, SearchParamProps, UserType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";

const DocumentPage = ({ params: { id } }: SearchParamProps) => {
  const router = useRouter();
  const queryClient = new QueryClient();
  const { user } = useContext(AuthContext);
  const [Document, setDocument] = useState<DocumentType | null>(null);
  const [currentUserType, setCurrentUserType] = useState<UserType>("viewer");
  const { data } = useQuery({
    queryKey: ["document"],
    queryFn: () => DocumentApi().Get(id),
    staleTime: 0,
  });
  useEffect(() => {
    const getData = async () => {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: ["document"],
          queryFn: () => DocumentApi().Get(id),
          staleTime: 0,
        });
        setDocument(data.data);
      } catch (error) {
        toast.error("Lỗi kết nối với máy chủ !!!");
        router.push("/");
      }
    };
    Document ? setDocument(data!.data) : getData();
  }, [data?.data]);

  useEffect(() => {
    if (!Document) return;
    if (user && user.user == Document!.author_id) {
      setCurrentUserType("editor");
    } else {
      Document?.collaborators?.forEach((collaborator) => {
        if (user && user.user == collaborator.id) {
          setCurrentUserType(collaborator.type ? "editor" : "viewer");
        }
      });
    }
  }, [Document]);
  return (
    <div>
      {!Document ? (
        <Loader />
      ) : (
        <CollaborativeRoom
          id={id}
          currentUserType={currentUserType}
          document={Document}
        />
      )}
    </div>
  );
};

export default DocumentPage;
