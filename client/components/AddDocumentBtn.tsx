"use client";

import React from "react";
import { Button } from "./ui/button";
import { CirclePlus } from "lucide-react";
import { DocumentApi } from "@/api/documentApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { hashCode } from "@/lib/utils";
import { toast } from "sonner";

export const AddDocumentBtn = () => {
  const queryClient = useQueryClient();

  const { mutate: CreateDocument } = useMutation({
    mutationFn: DocumentApi().CreateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Tạo thành công!");
    },
  });

  const AddDocumentHandler = () => {
    const token: any = JSON.parse(localStorage.getItem("authTokens") || "{}");
    const decoded: any = jwtDecode(token.access);
    const id = `${decoded.user_id}_${Date.now()}`;
    CreateDocument({
      document_id: hashCode(id).toString(),
      title: "New Document",
      content: "",
    });
  };

  return (
    <Button
      type="submit"
      onClick={AddDocumentHandler}
      className=" gradient-blue flex gap-1 shadow-md"
    >
      <CirclePlus />
      <p className="hidden sm:block">Start a blank Document</p>
    </Button>
  );
};
