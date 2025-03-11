import { useState } from "react";
import axios from "axios";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { S3 } from "../helpers/S3";
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

  const deleteImagesCloud = async (files, bucket) => {
    try {
      const { Deleted } = await S3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: files.map((k) => ({ Key: k })),
          },
        })
      );

      return Deleted;
    } catch (error) {
      console.error("Error in deleteImagesCloud:", error);
      throw error;
    }
  };

  return {
    fetchTags,
    addTag,
    uploadTemplate,
    deleteImagesCloud,
    loading,
    error,
  };
};
