import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  styled,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import axios from "axios";
import { URL_BACK, USER_ROLES } from "../constants";
import AcceptActionDialog from "../components/AcceptActionDialog";

const Item = styled(Paper)(({ theme }) => ({
  cursor: "pointer",
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

const AdminUsersPage = () => {
  const [newUser, setNewUser] = useState({
    userName: "",
    email: "",
    role: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [userList, setUsersList] = useState([]);
  const [update, setUpdate] = useState(false);
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
        role: newUser.role,
      })
      .then(() => setUpdate((prev) => !prev));
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
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Role</InputLabel>
          <Select
            name="role"
            value={newUser.role || ""}
            label="Role"
            onChange={handleNewUserChange}
          >
            {USER_ROLES.map((el) => (
              <MenuItem key={el} value={el.toLowerCase()}>
                {el}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          sx={{ height: "60px" }}
          onClick={handleAddNewUser}
          color="primary"
          variant="outlined"
        >
          Add
        </Button>
      </Box>
      {userList?.map((el) => (
        <Item
          key={el.name}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "start",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <Stack sx={{ borderBottom: "1px solid grey", width: "80%" }}>
            <Box display="flex" gap={2} alignItems="center">
              <Typography variant="body1">UserName:</Typography>
              <Typography variant="body2">{el.name}</Typography>
            </Box>
          </Stack>
          <Stack sx={{ borderBottom: "1px solid grey", width: "80%" }}>
            <Box display="flex" gap={2} alignItems="center">
              <Typography variant="body1">Email:</Typography>
              <Typography variant="body2">{el.email}</Typography>
            </Box>
          </Stack>
          <Stack sx={{ borderBottom: "1px solid grey", width: "80%" }}>
            <Box display="flex" gap={2} alignItems="center">
              <Typography variant="body1">Role:</Typography>
              <Typography variant="body2">{el.role}</Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={() => handleOpen(el.name)}
            color="error"
            sx={{ position: "absolute", right: 2, top: "30%" }}
          >
            <DeleteIcon />
          </IconButton>
        </Item>
      ))}
    </Box>
  );
};

export default AdminUsersPage;
