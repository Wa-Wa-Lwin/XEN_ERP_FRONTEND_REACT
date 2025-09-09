"use client";

import { useState } from "react";
import React from "react";
import { Button, Input, Divider, Form } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MicrosoftLogin from "./components/MicrosoftLogin";

export default function Component() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Validate Microsoft email domain
    if (!email.endsWith("@xenoptics.com")) {
      setError("Only @xenoptics.com emails are allowed.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(import.meta.env.VITE_APP_LOGIN_API_URL, {
        email,
        password,
      });

      // Example: save token or redirect
      localStorage.setItem("token", response.data.token);
      // window.location.href = "/dashboard"; // redirect after login
      navigate("/overview")
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }

   
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex h-full w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center pb-6">
        <p className="text-xl font-medium">Welcome Back</p>
        <p className="text-small text-default-500">Log in to your account to continue</p>        
      </div>
      <div className="rounded-large bg-content1 shadow-small mt-2 flex w-full max-w-sm flex-col gap-4 px-8 py-6">
        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            onChange={(e) => setEmail(e.target.value)}
            isRequired
            label="Xenoptics Email"
            name="email"
            placeholder="Enter your xenotpics email"
            type="email"
            variant="bordered"            
          />
          <Input
            onChange={(e) => setPassword(e.target.value)}
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="text-default-400 pointer-events-none text-2xl"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="text-default-400 pointer-events-none text-2xl"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Password"
            name="password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
          />  
          {error && <p className="text-red-500">{error}</p>}        
          <Button className="w-full" color="primary" type="submit">
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </Form>
        <div className="flex items-center gap-4">
          <Divider className="flex-1" />
          <p className="text-tiny text-default-500 shrink-0">or continue with</p>
          <Divider className="flex-1" />
        </div>
        <div className="flex flex-col gap-2">          
          <MicrosoftLogin />
        </div>
      </div>
    </div>
  );
}
