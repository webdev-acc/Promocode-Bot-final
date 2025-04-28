import {
  Box,
  Button,
  TextField,
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
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useState } from "react";
import axios from "axios";
import { URL_BACK, USER_ROLES } from "../constants";
import AcceptActionDialog from "../components/AcceptActionDialog";
import AlertBox from "../components/AlertBox";

const commonInputStyles = {
  fontSize: "1rem",
  lineHeight: "1.5",
  padding: "2px 0px",
  width: "180px",
  transition: "all 0.2s ease-in-out",
};

const inputContainerStyles = {
  borderRadius: "4px",
  padding: "0",
  border: "1px solid #e0e0e0",
};

const iconButtonStyles = {
  padding: "4px",
  fontSize: "2rem",
};

const Item = styled(Paper)(({ theme }) => ({
  cursor: "pointer",
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#37474f",
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
  const [editingUser, setEditingUser] = useState(null);
  const [editedUser, setEditedUser] = useState({
    userName: "",
    email: "",
    role: "",
  });
  const [editInfo, setEditInfo] = useState("");
  const [editError, setEditError] = useState("");

  const handleEditStart = (user) => {
    setEditingUser(user.id);
    setEditedUser({
      userName: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (userId) => {
    try {
      const user = userList.find((u) => u.id === userId);

      await axios.patch(`${URL_BACK}/users/${user.id}`, {
        userName: editedUser.userName,
        email: editedUser.email,
        role: editedUser.role,
      });

      setUpdate((prev) => !prev);

      setEditingUser(null);
      setEditedUser({ userName: "", email: "", role: "" });
      setEditInfo("Пользователь успешно обновлен");
    } catch (err) {
      console.error("Ошибка при сохранении пользователя:", err);
      setEditError("Ошибка при сохранении пользователя");
    }
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditedUser({ userName: "", email: "", role: "" });
  };

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
      <AlertBox shown={editInfo} textInfo={editInfo} type="success" />
      <AlertBox shown={editError} textInfo={editError} type="error" />
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
        <Button onClick={handleAddNewUser} color="primary" variant="contained">
          Add
        </Button>
      </Box>
      {userList?.map((el) => {
        const isEditing = editingUser === el.id;

        return (
          <Item
            key={el.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              justifyContent: "space-between",
              position: "relative",
              mb: 1,
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              border: "2px solid lightblue",
            }}
          >
            <Stack sx={{ width: "85%", mb: 1 }}>
              <Box display="flex" alignItems="center" width="100%" gap={3}>
                <Typography variant="body2" sx={{ width: "10%" }}>
                  Name:
                </Typography>
                <Box sx={{ flex: 1 }}>
                  {isEditing ? (
                    <TextField
                      size="small"
                      name="userName"
                      variant="outlined"
                      value={editedUser.userName}
                      onChange={handleEditChange}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          ...commonInputStyles,
                          textAlign: "left",
                        },
                      }}
                      sx={{
                        ...commonInputStyles,
                        ...inputContainerStyles,
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        ...commonInputStyles,
                        textAlign: "left",
                      }}
                    >
                      {el.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Stack>

            <Stack sx={{ width: "85%", mb: 1 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                gap={3}
              >
                <Typography variant="body2" sx={{ width: "10%" }}>
                  Email:
                </Typography>
                <Box sx={{ flex: 1 }}>
                  {isEditing ? (
                    <TextField
                      size="small"
                      name="email"
                      variant="outlined"
                      value={editedUser.email}
                      onChange={handleEditChange}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          ...commonInputStyles,
                          textAlign: "left",
                        },
                      }}
                      sx={{
                        ...commonInputStyles,
                        ...inputContainerStyles,
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        ...commonInputStyles,
                        textAlign: "left",
                      }}
                    >
                      {el.email}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Stack>

            <Stack sx={{ width: "85%", mb: 1 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                gap={3}
              >
                <Typography variant="body2" sx={{ width: "10%" }}>
                  Role:
                </Typography>
                <Box sx={{ flex: 1 }}>
                  {isEditing ? (
                    <FormControl
                      size="small"
                      sx={{
                        width: "180px",
                        "& .MuiInputBase-root": {
                          padding: "0",
                        },
                      }}
                    >
                      <Select
                        name="role"
                        value={editedUser.role}
                        variant="outlined"
                        onChange={handleEditChange}
                        sx={{
                          ...commonInputStyles,
                          ...inputContainerStyles,
                          textAlign: "left",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        }}
                      >
                        {USER_ROLES.map((role) => (
                          <MenuItem key={role} value={role.toLowerCase()}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        ...commonInputStyles,
                        textAlign: "left",
                      }}
                    >
                      {el.role}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Stack>

            <Box
              sx={{
                position: "absolute",
                right: 2,
                top: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                gap: 0.5,
              }}
            >
              {isEditing ? (
                <>
                  <IconButton
                    color="success"
                    onClick={() => handleEditSave(el.id)}
                    sx={iconButtonStyles}
                  >
                    <SaveIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={handleEditCancel}
                    sx={iconButtonStyles}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton
                    onClick={() => handleOpen(el.name)}
                    color="error"
                    sx={iconButtonStyles}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleEditStart(el)}
                    color="primary"
                    sx={iconButtonStyles}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </>
              )}
            </Box>
          </Item>
        );
      })}
    </Box>
  );
};

export default AdminUsersPage;
