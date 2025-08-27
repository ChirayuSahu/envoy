"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const LoginError = () => {
  const [errorMsg, setErrorMsg] = useState("");
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam === "CredentialsSignin") {
      setErrorMsg("Invalid username or password.");
    } else if (errorParam === "Callback") {
      setErrorMsg("Google sign-in failed. Try again.");
    } else if (errorParam) {
      setErrorMsg(errorParam);
    }
  }, [errorParam]);

  if (!errorMsg) return null;

  return (
    <p className="text-red-500 text-sm text-center w-full">{errorMsg}</p>
  );
};

export default LoginError;
