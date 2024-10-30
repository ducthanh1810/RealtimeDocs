import useAxios from "./useAxios";

const baseURL = process.env.NEXT_PUBLIC_BASE_API;

export const LoginApi = async (value: any) => {
  console.log(value);
  try {
    const response = await fetch(`${baseURL}/api/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    });
    const data = await response.json();
    if (data.token) {
      console.log(data.token);
      return { mes: "OK", token: data };
    } else {
      return "Login Fail";
    }
  } catch (error) {
    console.log(error);
    return "Connection Error";
  }
};

export function GetProfile() {
  const api = useAxios();
  const Get = () => {
    return api.get(`/api/me`);
  };
  const Put = (value: FormData) => {
    return api.put(`/api/me`, value, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };
  return { Get, Put };
}
