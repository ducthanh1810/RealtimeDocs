"use server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_SERVER;

export const authenticate = async (formData: {
  username: string;
  password: string;
}) => {
  try {
    const userCredentials = {
      username: formData.username,
      password: formData.password,
    };
    console.log(API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/api/token/`, {
      method: "POST",
      body: JSON.stringify(userCredentials),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.token) {
      cookies().set("access_token", data.token.access, { httpOnly: true });
      cookies().set("refresh_token", data.token.refresh, { httpOnly: true });
      return { mes: "OK", token: data.token };
    }
    return {
      mes: "Login failed! Please check your username or password.",
      token: null,
    };
  } catch (error) {
    console.log(error);
    return {
      mes: "connection error",
      token: null,
    };
  }
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const rfToken = {
      refresh: refreshToken,
    };
    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: "POST",
      body: JSON.stringify(rfToken),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.token) {
      cookies().set("access_token", data.token.access, { httpOnly: true });
      cookies().set("refresh_token", data.token.refresh, { httpOnly: true });
      return { mes: "OK", token: data.token };
    }
    return "Refresh Token Fail.";
  } catch (error) {
    console.log(error);
    return "connection error";
  }
};

export const logOut = async () => {
  try {
    const cookieStore = cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    return "OK";
  } catch (error) {
    console.log(error);
    return "Fail";
  }
};
