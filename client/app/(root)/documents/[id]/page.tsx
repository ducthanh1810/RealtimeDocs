"use client";
import { DocumentApi } from "@/api/documentApi";
import { CollaborativeRoom } from "@/components/CollaborativeRoom";
import Loader from "@/components/Loader";
import { DocumentType, SearchParamProps } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";

const DocumentPage = ({ params: { id } }: SearchParamProps) => {
  const router = useRouter();
  const queryClient = new QueryClient();
  const [Document, setDocument] = useState<DocumentType | null>(null);
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
  return (
    <div>
      {!Document ? (
        <Loader />
      ) : (
        <CollaborativeRoom
          id={id}
          currentUserType="editor"
          document={Document}
        />
      )}
    </div>
  );
};

export default DocumentPage;
