import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Button, FormControl } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InputSelect from "../ui/InputSelect";
import TagForm from "../components/TagForm";
import FileUploadButton from "../components/FileUploadButton";
import { useTemplateApi } from "../hooks/useTemplateApi";
import AlertBox from "../components/AlertBox";
import { languagesToArray } from "../helpers/languagesToArray";
import { TEMPLATE_SIZES, TEMPLATE_TYPES, TEMPLATES_GEO } from "../constants";

const AddTemplateForm = () => {
  const { fetchTags, addTag, uploadTemplate, loading, error } =
    useTemplateApi();
  const [tagOptions, setTagOptions] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [newTagError, setNewTagError] = useState("");
  const [successIcon, setSuccessIcon] = useState(false);
  const [successInfo, setSuccessInfo] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      geo: "",
      languages: "",
      type: "",
      size: "",
      img: null,
      tags: [],
    },
  });

  useEffect(() => {
    fetchTags().then(setTagOptions).catch(console.error);
  }, []);

  const handleAddTag = async () => {
    if (successIcon) {
      setNewTagError("Тег уже добавлен, введите новый");
      return;
    }
    try {
      await addTag(newTag);
      setNewTag("");
      setSuccessIcon(true);
      fetchTags().then(setTagOptions);
      setTimeout(() => setSuccessIcon(false), 1000);
    } catch (err) {
      setNewTagError(err.response?.data.message || "Ошибка добавления тега");
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("geo", data.geo);
    formData.append("languages", data.languages);
    formData.append("type", data.type);
    formData.append("size", data.size);
    formData.append("img", data.img);
    formData.append("tags", JSON.stringify(data.tags));

    console.log(data);

    try {
      await uploadTemplate(formData);
      setSuccessInfo("Креатив успешно загружен");
      reset();
    } catch (err) {
      console.error("Ошибка при загрузке:", err);
    }
  };

  return (
    <Box mt={2}>
      {successInfo && (
        <AlertBox shown={successInfo} textInfo={successInfo} type="success" />
      )}
      {error && <AlertBox shown={error} textInfo={error} type="error" />}
      <FormControl
        sx={{ display: "flex", gap: 3 }}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          name="geo"
          control={control}
          rules={{ required: "Поле Geo обязательно" }}
          render={({ field }) => (
            <InputSelect
              {...field}
              label="Geo"
              options={TEMPLATES_GEO}
              error={!!errors.geo}
              helperText={errors.geo?.message}
            />
          )}
        />
        <Controller
          name="languages"
          control={control}
          rules={{ required: "Поле Language обязательно" }}
          render={({ field }) => (
            <InputSelect
              {...field}
              label="Language"
              options={languagesToArray()}
              error={!!errors.languages}
              helperText={errors.languages?.message}
            />
          )}
        />
        <Controller
          name="tags"
          control={control}
          rules={{ required: "Поле Tags обязательно" }}
          render={({ field }) => (
            <TagForm
              newTag={newTag}
              setNewTag={setNewTag}
              newTagError={newTagError}
              successIcon={successIcon}
              tagOptions={tagOptions}
              handleAddTag={handleAddTag}
              field={{
                ...field,
                value: field.value || [], // Убедимся, что value всегда массив
                onChange: (e) => field.onChange(e.target.value), // Передаём только value
              }}
              error={!!errors.tags}
              helperText={errors.tags?.message}
            />
          )}
        />
        <Controller
          name="type"
          control={control}
          rules={{ required: "Поле Type обязательно" }}
          render={({ field }) => (
            <InputSelect
              {...field}
              label="Type"
              options={TEMPLATE_TYPES}
              error={!!errors.type}
              helperText={errors.type?.message}
            />
          )}
        />
        <Controller
          name="size"
          control={control}
          rules={{ required: "Поле Size обязательно" }}
          render={({ field }) => (
            <InputSelect
              {...field}
              label="Size"
              options={TEMPLATE_SIZES}
              error={!!errors.size}
              helperText={errors.size?.message}
            />
          )}
        />
        <Controller
          name="img"
          control={control}
          rules={{ required: "Поле Image обязательно" }}
          render={({ field: { onChange, value } }) => (
            <FileUploadButton
              value={value}
              onChange={(e) => onChange(e.target.files[0])}
              error={!!errors.img}
              helperText={errors.img?.message}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={<CloudUploadIcon />}
        >
          {loading ? "Загрузка..." : "Upload template"}
        </Button>
      </FormControl>
    </Box>
  );
};

export default AddTemplateForm;
