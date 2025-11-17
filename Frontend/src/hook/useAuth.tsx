"use client";

import { useEffect, useState } from "react";

type ErrorType = Error | null;

type ErrorInputEmpty = string | null;

interface UserLogin {
  access: string;
  refresh: string;
}

interface InitialLoginForm {
  email: string;
  password: string;
}

interface InitialLoginForm {
  email: string;
  password: string;
}

const useAuth = () => {
  const initialLoginForm: InitialLoginForm = {
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState<InitialLoginForm>(initialLoginForm);
  const [error, setError] = useState<ErrorType>(null);
  const [errorInputEmpty, setErrorInputEmpty] = useState<ErrorInputEmpty>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const time = setTimeout(() => {
      setError(null);
      setErrorInputEmpty(null);
    }, 5000);

    return () => clearTimeout(time);
  }, [error, errorInputEmpty]);

  const loginUser = async () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer ",
      },
      body: JSON.stringify(formData),
    };

    setLoading(true);
    const URL = "https://apitestimonial.vercel.app/app/login/";

    try {
      const response = await fetch(URL, options);

      if (!response.ok) {
        throw new Error(`Email o contraseña invalida  `);
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return setErrorInputEmpty("Los campos no pueden ir vacios");
    }
    loginUser();
  };

  return {
    handleInputChange,
    handleSubmit,
    error,
    errorInputEmpty,
    loading,
    formData,
  };
};
export default useAuth;
