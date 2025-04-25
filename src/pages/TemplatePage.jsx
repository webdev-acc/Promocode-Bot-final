import { useParams, useLocation } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { retrieveLaunchParams } from "@telegram-apps/sdk";
import axios from "axios";
import AlertBox from "../components/AlertBox";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InputSelect from "../ui/InputSelect";
import { useTemplateApi } from "../hooks/useTemplateApi";
import { TEMPLATE_SIZES, TEMPLATES_GEO, URL_BACK } from "../constants";
import { languagesToArray } from "../helpers/languagesToArray";
import { useAuth } from "../hooks/useAdmin";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const TemplatePage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState("");
  const { isUser } = useAuth();
  const svgContainerRef = useRef(null);
  const { tgWebAppData } = retrieveLaunchParams();
  const CHAT_ID = tgWebAppData.user.id;
  const TOKEN = "7761331474:AAFrYS-1IjADnuRdmEsw74Q2fKtCW-IaY-Q";
  const [downloadInfo, setDownloadInfo] = useState("");
  const [saveStatus, setSaveStatus] = useState({ error: "", success: "" });
  const [editValues, setEditValues] = useState(state);
  const { fetchTags } = useTemplateApi();
  const [tagOptions, setTagOptions] = useState([]);
  const [loader, setLoader] = useState(false);
  const [promocodes, setPromocodes] = useState([""]);

  const fetchFileData = async () => {
    try {
      const response = await axios.get(`${URL_BACK}/templates/${id}`);
      const { fileData, ...fileInfo } = response.data;

      setSvgContent(fileData);
      setEditValues(fileInfo);
    } catch (error) {
      console.error("Ошибка при получении файла:", error);
      setError(
        "Не удалось загрузить изображение: " +
          (error.message || "Неизвестная ошибка")
      );
    }
  };

  useEffect(() => {
    fetchTags().then(setTagOptions).catch(console.error);
  }, []);

  const handlePromocodeChange = (index, value) => {
    setPromocodes((prev) => {
      const newCodes = [...prev];
      newCodes[index] = value;
      return newCodes;
    });
  };

  const addPromocodeField = () => {
    setPromocodes((prev) => [...prev, ""]);
  };

  const sendImageToTelegram = async (blob, code) => {
    try {
      const fileInfo = [
        `Geo: ${editValues.geo}`,
        `Language: ${editValues.language}`,
        `Size: ${editValues.size}`,
        `Type: ${editValues.type}`,
        `Tags: ${editValues.tags.map((tag) => `#${tag.name}`).join(" ")}`,
        `Promocode: ${code}`,
      ].join("\n");

      const telegramFormData = new FormData();
      telegramFormData.append("chat_id", CHAT_ID);
      telegramFormData.append("document", blob, "image.png");
      telegramFormData.append("caption", fileInfo);

      await axios.post(
        `https://api.telegram.org/bot${TOKEN}/sendDocument`,
        telegramFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setDownloadInfo("Файлы отправлены в Telegram!");
    } catch (err) {
      console.log("Ошибка при отправке в Telegram:", err.message || err);
      setDownloadInfo(
        "Ошибка: " + (err.message || "Не удалось отправить файл")
      );
    } finally {
      setLoader(false);
    }
  };

  const downloadSVGAsPNG = async () => {
    const svgContainer = svgContainerRef.current;
    if (!svgContainer) return;
    setLoader(true);

    const fullHDWidth = 1920;
    const aspectRatio = svgContainer.offsetHeight / svgContainer.offsetWidth;
    const fullHDHeight = Math.round(fullHDWidth * aspectRatio);

    for (const code of promocodes) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const textElement = doc.getElementById("PROMOCODE");
      if (textElement) {
        const tspan = textElement.querySelector("tspan");
        if (tspan) tspan.textContent = code;
      }
      const updatedSVG = new XMLSerializer().serializeToString(doc);

      const tempContainer = svgContainer.cloneNode(true);
      tempContainer.innerHTML = updatedSVG;
      tempContainer.style.position = "absolute";
      tempContainer.style.top = "-9999px";
      tempContainer.style.left = "-9999px";
      tempContainer.style.width = `${fullHDWidth}px`;
      tempContainer.style.height = `${fullHDHeight}px`;

      document.body.appendChild(tempContainer);

      try {
        const canvas = await html2canvas(tempContainer, {
          backgroundColor: null,
          scale: 1,
          width: fullHDWidth,
          height: fullHDHeight,
          useCORS: true,
        });

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png", 1.0)
        );
        await axios.post(`${URL_BACK}/banners/${id}/download`);
        await sendImageToTelegram(blob, code);
      } finally {
        document.body.removeChild(tempContainer);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchFileData();
    }
  }, [id]);

  useEffect(() => {
    if (!svgContent) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const textElement = doc.getElementById("PROMOCODE");

    if (textElement) {
      const tspan = textElement.querySelector("tspan");
      if (tspan) tspan.textContent = promocodes[0] || "";
      setSvgContent(new XMLSerializer().serializeToString(doc));
    }
  }, [promocodes]);

  const handleChangeValues = (event) => {
    const { name, value } = event.target;

    if (name === "tags") {
      const updatedTags = value
        .map((selectedId) => {
          const tag = tagOptions.find((option) => option.id === selectedId);
          return (
            tag ||
            editValues.tags.find((existingTag) => existingTag.id === selectedId)
          );
        })
        .filter(Boolean);

      setEditValues((prev) => ({
        ...prev,
        tags: updatedTags,
      }));
    } else {
      setEditValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();
      if (editValues.name) formData.append("name", editValues.name);
      if (editValues.geo) formData.append("geo", editValues.geo);
      if (editValues.language)
        formData.append("languages", editValues.language);
      if (editValues.size) formData.append("size", editValues.size);
      if (editValues.tags.length > 0) {
        const tagIds = editValues.tags.map((tag) => tag.id);
        formData.append("tags", JSON.stringify(tagIds));
      }
      if (editValues.date_from)
        formData.append("date_from", editValues.date_from);
      if (editValues.date_to) formData.append("date_to", editValues.date_to);

      await axios.patch(`${URL_BACK}/template/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSaveStatus((prev) => ({
        ...prev,
        success: "Креатив успешно обновлен",
      }));
    } catch (err) {
      setSaveStatus((prev) => ({
        ...prev,
        error: "Ошибка: " + (err.response?.data?.message || err.message),
      }));
    }
  };

  const tagValues = Array.isArray(editValues.tags)
    ? editValues.tags.map((tag) => tag.id).filter(Boolean)
    : [];

  return (
    <Box
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      mt={3}
    >
      <AlertBox shown={downloadInfo} textInfo={downloadInfo} type="success" />
      <AlertBox
        shown={saveStatus.error}
        textInfo={saveStatus.error}
        type="error"
      />
      <AlertBox
        shown={saveStatus.success}
        textInfo={saveStatus.success}
        type="success"
      />
      <AlertBox shown={error} textInfo={error} type="error" />
      <Accordion sx={{ mb: 2, width: "100%" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography component="span">INFO</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <InputSelect
            readOnly={isUser}
            label="Geo"
            name="geo"
            options={TEMPLATES_GEO}
            value={editValues.geo}
            onChange={handleChangeValues}
          />
          <InputSelect
            readOnly={isUser}
            label="Language"
            name="language"
            options={languagesToArray()}
            value={editValues.language}
            onChange={handleChangeValues}
          />
          <InputSelect
            readOnly={isUser}
            label="Size"
            name="size"
            options={TEMPLATE_SIZES}
            value={editValues.size}
            onChange={handleChangeValues}
          />
          <InputSelect
            readOnly={isUser}
            label="Tags"
            name="tags"
            options={tagOptions}
            value={tagValues}
            multi
            onChange={handleChangeValues}
            existingTags={editValues.tags}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileDatePicker
              label="Date from"
              value={dayjs(editValues.date_from)}
              disablePast
              onChange={(date) =>
                handleChangeValues({
                  target: {
                    name: "date_from",
                    value: date ? date.toISOString() : "",
                  },
                })
              }
            />
            <MobileDatePicker
              label="Date to"
              value={dayjs(editValues.date_to)}
              disablePast
              onChange={(date) =>
                handleChangeValues({
                  target: {
                    name: "date_to",
                    value: date ? date.toISOString() : "",
                  },
                })
              }
            />
          </LocalizationProvider>
          {!isUser && <Button onClick={handleSaveChanges}>Save changes</Button>}
        </AccordionDetails>
      </Accordion>

      {svgContent ? (
        <Box
          ref={svgContainerRef}
          dangerouslySetInnerHTML={{ __html: svgContent }}
          sx={{
            width: "auto",
            height: "auto",
            backgroundColor: "transparent",
            "& svg": {
              width: "100%",
              height: "100%",
              display: "block",
            },
            "& svg text": { fontFamily: '"Roboto", sans serif' },
          }}
        />
      ) : (
        <Typography>Загрузка изображения...</Typography>
      )}

      {promocodes.map((code, index) => (
        <TextField
          key={index}
          value={code}
          label={`Промокод ${index + 1}`}
          onChange={(e) => handlePromocodeChange(index, e.target.value)}
          color="warning"
          fullWidth
          sx={{ maxWidth: 700, my: 1 }}
        />
      ))}
      <Button onClick={addPromocodeField} sx={{ mb: 2 }}>
        Добавить ещё промокод
      </Button>

      <Button
        loading={loader}
        fullWidth
        size="large"
        color="success"
        variant="outlined"
        onClick={downloadSVGAsPNG}
        endIcon={<FileDownloadIcon />}
      >
        Download
      </Button>
    </Box>
  );
};

export default TemplatePage;
