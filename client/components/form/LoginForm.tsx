"use client";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { LoaderCircle } from "lucide-react";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { authenticate } from "@/lib/authActions";

const formSchema = z.object({
  username: z.string().min(1),
  password: z
    .string()
    .min(1, { message: "Password must be at least 1 characters" }),
});

type UserFormValue = z.infer<typeof formSchema>;

export const UserAuthForm = ({ className }: { className?: string }) => {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState<z.infer<typeof formSchema>>();
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");

  const defaultValues = {
    username: "t",
    password: "t",
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setUser(value);
    setIsLogin(true);
  };

  useEffect(() => {
    const login = async () => {
      const result: { mes: string; token: string } = await authenticate(user!);
      if (result.mes == "OK") {
        localStorage.setItem("authTokens", JSON.stringify(result.token));
        router.push("/");
      } else {
        setErr(result.mes);
        setIsLoading(false);
      }
    };
    isLogin && login();
  }, [isLogin]);

  return (
    <div className={cn(className, "")}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className=" font-bold">Username</FormLabel>
                <FormControl>
                  <Input
                    type="string"
                    placeholder="Enter your email..."
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className=" font-bold">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password..."
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>{err && <p className=" text-red-600 text-center">{err}</p>}</div>
          <Button disabled={isLoading} className="ml-auto w-full" type="submit">
            {isLoading ? (
              <LoaderCircle className="animate-spin ml-2" />
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
