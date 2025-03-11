import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAdmin";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { Box, IconButton, useColorScheme } from "@mui/material";

export default function Layout() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const currentUser = useAuth();
  const { mode, setMode } = useColorScheme();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (endpoint) => {
    navigate(endpoint);
    setAnchorEl(null);
  };
  return (
    <>
      <Box display="flex" justifyContent="space-between" mt={2}>
        <IconButton
          color="primary"
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          <MenuIcon />{" "}
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleClose(null)}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={() => handleClose("/")}>Главная страница</MenuItem>
          {currentUser.superuser && (
            <MenuItem onClick={() => handleClose("/add_admin")}>
              Добавить администратора
            </MenuItem>
          )}
          {currentUser.adminAccess && (
            <MenuItem onClick={() => handleClose("/add_template")}>
              Добавить новый креатив
            </MenuItem>
          )}
        </Menu>
        <Box display="flex" justifyContent="flex-end" flexGrow={1}>
          {(mode === "dark" || mode === "system") && (
            <IconButton onClick={() => setMode("light")}>
              <LightModeIcon />
            </IconButton>
          )}
          {mode === "light" && (
            <IconButton onClick={() => setMode("dark")}>
              <DarkModeIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      <Outlet />
    </>
  );
}
