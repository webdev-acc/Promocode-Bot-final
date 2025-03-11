import { useEffect, useState } from "react";

import {
  Box,
  IconButton,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { useTemplateApi } from "../hooks/useTemplateApi";
import AlertBox from "../components/AlertBox";
import { Delete } from "@mui/icons-material";
import axios from "axios";
import { URL_BACK } from "../constants";
import AcceptActionDialog from "./AcceptActionDialog";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const TagsListControl = () => {
  const { fetchTags } = useTemplateApi();
  const [updateList, setUpdateList] = useState(false);
  const [tagsList, setTagsList] = useState([]);
  const [open, setOpen] = useState(false);
  const [tagId, setTagId] = useState(null);
  const [tagName, setTagName] = useState(null);

  useEffect(() => {
    fetchTags().then(setTagsList).catch(console.error);
  }, [updateList]);

  const onRemoveClick = (id) => {
    axios
      .delete(`${URL_BACK}/tag/${id}`)
      .finally(setUpdateList((prev) => !prev));
  };

  const handleOpen = (tagId, tagName) => {
    setTagId(tagId);
    setTagName(tagName);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTagId(null);
  };

  const acceptRemoveuser = () => {
    onRemoveClick(tagId);
    handleClose();
  };

  return (
    <Box mt={2}>
      <AcceptActionDialog
        handleClose={handleClose}
        handleAccept={acceptRemoveuser}
        open={open}
        target={tagName}
      />
      <TableContainer component={Paper}>
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <TableBody>
            {tagsList.map((tag) => (
              <StyledTableRow key={tag.id}>
                <StyledTableCell component="th" scope="row">
                  #{tag.name}
                </StyledTableCell>
                <StyledTableCell
                  component="th"
                  scope="row"
                  sx={{ textAlign: "right" }}
                >
                  <IconButton
                    color="error"
                    onClick={() => handleOpen(tag.id, tag.name)}
                  >
                    <Delete />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TagsListControl;
