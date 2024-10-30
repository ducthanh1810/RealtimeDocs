import { UserAuthForm } from "@/components/form/LoginForm";
import React from "react";

const LoginPage = () => {
  return (
    <div className=" relative w-full h-screen bg-bg-login">
      <div className=" absolute w-[25rem] px-5 py-16 items-center justify-center rounded-md backdrop-blur-0 bg-white/50 translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%]">
        <div className="p-2 space-y-2">
          <h1 className="text-4xl font-bold text-center">Login</h1>
          <p className="text-sm text-center">Welcome !!!</p>
        </div>
        <UserAuthForm />
      </div>
    </div>
  );
};

export default LoginPage;
