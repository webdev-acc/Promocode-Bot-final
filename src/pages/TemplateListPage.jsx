import { useEffect, useState } from "react";
import TemplateCard from "../ui/TemplateCard";
import { Box, Button, Grid2, IconButton, Typography } from "@mui/material";
import InputSelect from "../ui/InputSelect";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  resetFilters,
  selectFilters,
  setDateFrom,
  setDateTo,
  setLang,
  setPage,
  setSize,
  setTags,
  setType,
} from "../store/slices/creoFiltersSlice/creoFiltersSlice";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { URL_BACK } from "../constants";
import AcceptActionDialog from "../components/AcceptActionDialog";
import { useAuth } from "../hooks/useAdmin";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { selectUsers } from "../store/slices/users/usersSlice";

const TemplateListPage = () => {
  const [templatesList, setTemplatesList] = useState([]);
  const filters = useSelector(selectFilters);
  const [filterOptions, setFilterOptions] = useState({
    tags: [],
    types: [],
    sizes: [],
    languages: [],
  });
  const [totalPages, setTotalPages] = useState(1);
  const [removeId, setRemoveId] = useState(null);
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [updateList, setUpdateList] = useState(false);
  const [targetName, setTargetName] = useState("");
  const { isUser, addUserId } = useAuth();
  const { currentUser } = useSelector(selectUsers);

  useEffect(() => {
    if (!currentUser.id || !currentUser.userId) return;

    addUserId(currentUser.id, currentUser.userId);
  }, [currentUser.id, currentUser.userId]);

  const handleChangeFilters = (event) => {
    const { name, value } = event.target;

    if (name === "tags") dispatch(setTags(value));
    if (name === "type") dispatch(setType(value));
    if (name === "size") dispatch(setSize(value));
    if (name === "lang") dispatch(setLang(value));
    if (name === "date_from") dispatch(setDateFrom(value));
    if (name === "date_to") dispatch(setDateTo(value));
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
    } catch (error) {
      console.error("Ошибка при получении файлов из S3:", error);
    }
  };

  useEffect(() => {
    axios.get(`${URL_BACK}/filters`).then(({ data }) => {
      setFilterOptions({
        tags: data.tags,
        types: data.types,
        sizes: data.sizes,
        languages: data.languages,
      });
    });
  }, []);

  useEffect(() => {
    axios
      .get(
        `${URL_BACK}/templates?type=${filters.type}&size=${
          filters.size
        }&language=${filters.lang}&tags=${filters.tags}&page=${
          filters.page
        }&limit=${filters.limit}&date_from=${
          filters.date_from ? filters.date_from : ""
        }&date_to=${filters.date_to ? filters.date_to : ""}`
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              options={filterOptions.types}
              label="Type"
              name="type"
            />
          </Grid2>
          <Grid2 size={6}>
            <InputSelect
              onChange={handleChangeFilters}
              value={filters.tags}
              options={filterOptions.tags}
              label="Tags"
              name="tags"
              multi
            />
          </Grid2>
          <Grid2 size={6}>
            <InputSelect
              onChange={handleChangeFilters}
              value={filters.size}
              options={filterOptions.sizes}
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
              options={filterOptions.languages}
            />
          </Grid2>
          <Grid2 size={6}>
            <MobileDatePicker
              sx={{ maxWidth: "100%" }}
              label="Date from"
              value={filters.date_from ? dayjs(filters.date_from) : null}
              disablePast
              onChange={(date) =>
                handleChangeFilters({
                  target: {
                    name: "date_from",
                    value: date ? date.toISOString() : "",
                  },
                })
              }
            />
          </Grid2>
          <Grid2 size={6}>
            <MobileDatePicker
              sx={{ maxWidth: "100%" }}
              label="Date to"
              value={filters.date_from ? dayjs(filters.date_to) : null}
              disablePast
              onChange={(date) =>
                handleChangeFilters({
                  target: {
                    name: "date_to",
                    value: date ? date.toISOString() : "",
                  },
                })
              }
            />
          </Grid2>
          <Button fullWidth onClick={handleResetFilters} variant="contained">
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
                  showRemoveBtn={!isUser}
                />
              </Box>
            ))}
          </Box>
        }
        {/* Пагинация */}
        {templatesList.length ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={3}
          >
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
    </LocalizationProvider>
  );
};

export default TemplateListPage;
