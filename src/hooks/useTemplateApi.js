import { useState } from "react";
import axios from "axios";
import { URL_BACK } from "../constants";

export const useTemplateApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTags = async () => {
    const { data } = await axios.get(`${URL_BACK}/tags`);
    return data.map((el) => ({ name: el.name, value: el.id, id: el.id }));
  };

  const addTag = async (tag) => {
    await axios.post(`${URL_BACK}/tag`, { tag });
  };

  const uploadTemplate = async (formData) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${URL_BACK}/template`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data; // Бэкенд вернет bannerId и imageUrl
    } catch (error) {
      setError(error.response?.data.message || "Ошибка загрузки");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchTags,
    addTag,
    uploadTemplate,
    loading,
    error,
  };
};
