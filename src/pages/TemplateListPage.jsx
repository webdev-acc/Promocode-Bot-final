import { useEffect, useState } from "react";
import TemplateCard from "../ui/TemplateCard";
import { Box, Button, Grid2, IconButton, Typography } from "@mui/material";
import InputSelect from "../ui/InputSelect";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  resetFilters,
  selectFilters,
  setLang,
  setPage,
  setSize,
  setTags,
  setType,
} from "../store/slices/creoFiltersSlice/creoFiltersSlice";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TEMPLATE_TYPES, URL_BACK, TEMPLATE_SIZES } from "../constants";
import { languagesToArray } from "../helpers/languagesToArray";
import AcceptActionDialog from "../components/AcceptActionDialog";

const TemplateListPage = () => {
  const [templatesList, setTemplatesList] = useState([]);
  const filters = useSelector(selectFilters);
  const [tagOptions, setTagOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [langOptions, setLangOptions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [removeId, setRemoveId] = useState(null);
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [updateList, setUpdateList] = useState(false);
  const [targetName, setTargetName] = useState("");

  const handleChangeFilters = (event) => {
    const { name, value } = event.target;

    if (name === "tags") dispatch(setTags(value));
    if (name === "type") dispatch(setType(value));
    if (name === "size") dispatch(setSize(value));
    if (name === "lang") dispatch(setLang(value));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const handlePrevPage = () => {
    if (filters.page > 1) {
      dispatch(setPage(filters.page - 1));
    }
  };

  const handleNextPage = () => {
    if (filters.page < totalPages) {
      dispatch(setPage(filters.page + 1));
    }
  };

  const fetchFilesData = async (filesData) => {
    try {
      setTemplatesList(filesData);
      const uniqueTypes = [...new Set(filesData.map((t) => t.type))].map(
        (type) => ({
          name: type,
          value: type,
        })
      );
      const uniqueSizes = [...new Set(filesData.map((t) => t.size))].map(
        (size) => ({
          name: size,
          value: size,
        })
      );
      const uniqueLangs = [...new Set(filesData.map((t) => t.language))].map(
        (lang) => ({
          name: lang,
          value: lang,
        })
      );
      const uniqueTags = [
        ...new Set(filesData.flatMap((t) => t.tags.map((tag) => tag.id))),
      ].map((id) => {
        const tag = filesData.flatMap((t) => t.tags).find((t) => t.id === id);
        return { name: tag.name, value: tag.id, id: tag.id };
      });

      setTypeOptions(uniqueTypes);
      setSizeOptions(uniqueSizes);
      setLangOptions(uniqueLangs);
      setTagOptions(uniqueTags);
    } catch (error) {
      console.error("Ошибка при получении файлов из S3:", error);
    }
  };

  useEffect(() => {
    axios.get(`${URL_BACK}/tags`).then(({ data }) => {
      const tags = data.map((el) => {
        return { name: el.name, value: el.id, id: el.id };
      });
      setTagOptions(tags);
    });
  }, []);

  useEffect(() => {
    axios
      .get(
        `${URL_BACK}/templates?type=${filters.type}&size=${filters.size}&language=${filters.lang}&tags=${filters.tags}&page=${filters.page}&limit=${filters.limit}`
      )
      .then(({ data }) => {
        fetchFilesData(data.data);
        setTotalPages(data.totalPages);
      })
      .catch((error) => console.error("Ошибка загрузки данных:", error));
  }, [filters, updateList]);

  const onRemoveBtnClick = (event, templateKey, name) => {
    event.stopPropagation();
    setRemoveId(templateKey);
    setOpenDialog(true);
    setTargetName(name);
  };

  const onAcceptRemoveClick = async () => {
    try {
      await axios.delete(`${URL_BACK}/templates/${removeId}`);
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setOpenDialog(false);
      setUpdateList((prev) => !prev);
    }
  };

  return (
    <Box mt={2} display="flex" flexDirection="column" alignItems="center">
      <AcceptActionDialog
        handleClose={() => setOpenDialog(false)}
        handleAccept={onAcceptRemoveClick}
        open={openDialog}
        target={targetName}
      />
      {/* Фильтры */}
      <Grid2 container spacing={2} width="100%">
        <Grid2 size={6}>
          <InputSelect
            onChange={handleChangeFilters}
            value={filters.type}
            options={typeOptions}
            label="Type"
            name="type"
          />
        </Grid2>
        <Grid2 size={6}>
          <InputSelect
            onChange={handleChangeFilters}
            value={filters.tags}
            options={tagOptions}
            label="Tags"
            name="tags"
            multi
          />
        </Grid2>
        <Grid2 size={6}>
          <InputSelect
            onChange={handleChangeFilters}
            value={filters.size}
            options={sizeOptions}
            label="Size"
            name="size"
          />
        </Grid2>
        <Grid2 size={6}>
          <InputSelect
            required
            name="lang"
            value={filters.lang}
            label="Language"
            onChange={handleChangeFilters}
            options={langOptions}
          />
        </Grid2>
        <Button fullWidth onClick={handleResetFilters} variant="outlined">
          Reset filters
        </Button>
      </Grid2>
      {/* Список карточек */}
      {
        <Box width="100%">
          {!templatesList.length && (
            <Typography mt={5} width="100%" textAlign="center" variant="h5">
              Empty
            </Typography>
          )}
          {templatesList?.map((template) => (
            <Box key={template.id} sx={{ flexGrow: 1, overflow: "hidden" }}>
              <TemplateCard
                template={template}
                removeBtnClick={(event) =>
                  onRemoveBtnClick(event, template.id, template.name)
                }
              />
            </Box>
          ))}
        </Box>
      }
      {/* Пагинация */}
      {templatesList.length ? (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
          <IconButton onClick={handlePrevPage} disabled={filters.page === 1}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography>
            Page {filters.page} / {totalPages}
          </Typography>
          <IconButton
            onClick={handleNextPage}
            disabled={filters.page >= totalPages}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      ) : (
        ""
      )}
    </Box>
  );
};

export default TemplateListPage;
