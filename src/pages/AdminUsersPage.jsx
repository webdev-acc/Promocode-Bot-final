import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  InputLabel,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import axios from "axios";
import { URL_BACK } from "../constants";
import AcceptActionDialog from "../components/AcceptActionDialog";

const AdminUsersPage = () => {
  const [newUser, setNewUser] = useState({
    userName: "",
    email: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [userList, setUsersList] = useState([]);
  const [update, setUpdate] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAddNewUser = () => {
    if (!newUser.userName || !newUser.email) {
      return setErrorMessage("Обязательное поле");
    }

    axios
      .post(`${URL_BACK}/newUser`, {
        userName: newUser.userName,
        email: newUser.email,
        superuser: isSuperUser,
      })
      .then(() => setUpdate((prev) => !prev));
  };

  const handleCheckbox = (event) => {
    setIsSuperUser(event.target.checked);
  };

  const handleOpen = (userName) => {
    setSelectedUser(userName);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;

    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const fetchRremoveUser = (userName) => {
    if (!selectedUser) return;
    axios
      .delete(`${URL_BACK}/deleteUser/${userName}`)
      .then(() => setUpdate((prev) => !prev));
  };

  const acceptRemoveuser = () => {
    fetchRremoveUser(selectedUser);
    handleClose();
  };

  useEffect(() => {
    axios.get(`${URL_BACK}/users`).then(({ data }) => setUsersList(data));
  }, [update]);

  return (
    <Box mt={2}>
      <AcceptActionDialog
        handleClose={handleClose}
        handleAccept={acceptRemoveuser}
        open={open}
        target={selectedUser}
      />
      <Box
        display="flex"
        gap={2}
        flexDirection="column "
        justifyContent="space-between"
        mb={2}
      >
        <TextField
          helperText={(!newUser.userName && errorMessage) ?? errorMessage}
          error={!newUser.userName && errorMessage}
          label="Username"
          name="userName"
          value={newUser.userName}
          onChange={handleNewUserChange}
        />
        <TextField
          helperText={(!newUser.email && errorMessage) ?? errorMessage}
          error={!newUser.email && errorMessage}
          label="Email"
          type="email"
          name="email"
          value={newUser.email}
          onChange={handleNewUserChange}
        />
        <InputLabel
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Advanced rights</Typography>
          <Checkbox
            checked={isSuperUser}
            onChange={handleCheckbox}
            inputProps={{ "aria-label": "controlled" }}
          />
        </InputLabel>
        <Button
          sx={{ height: "60px" }}
          onClick={handleAddNewUser}
          color="primary"
          variant="outlined"
        >
          Add
        </Button>
      </Box>
      <Box>
        <List dense sx={{ width: "100%", bgcolor: "background.paper" }}>
          {userList?.map((value) => {
            const labelId = `checkbox-list-secondary-label-${value.name}`;
            return (
              <ListItem
                key={value.name}
                secondaryAction={
                  <IconButton
                    onClick={() => handleOpen(value.name)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemText
                  id={labelId}
                  secondary={value.name}
                  primary="User name"
                />
                <ListItemText
                  id={labelId}
                  primary="Email"
                  secondary={value.email}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

export default AdminUsersPage;
