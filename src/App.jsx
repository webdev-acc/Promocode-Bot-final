import { Box, CircularProgress, Container, Typography } from "@mui/material";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import TemplateListPage from "./pages/TemplateListPage";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter, Route, Routes } from "react-router";
import TemplatePage from "./pages/TemplatePage";
import { AdminTemplatePage } from "./pages/AdminTemplatePage";
import AdminUsersPage from "./pages/AdminUsersPage";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { useEffect, useState } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk";
import axios from "axios";
import { URL_BACK } from "./constants";

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

function App() {
  const { tgWebAppData } = retrieveLaunchParams();

  const userId = tgWebAppData?.user?.id;
  const userName = tgWebAppData?.user?.username;
  const [userAccess, setUserAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && userName) {
      axios
        .get(`${URL_BACK}/user_access/${userName}/${userId}`)
        .then((res) => {
          setUserAccess(res.data.exists);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setUserAccess(false);
          setLoading(false);
        });
    } else {
      setUserAccess(false);
      setLoading(false);
    }
  }, [userId, userName]);

  if (loading) {
    return (
      <Box
        sx={{
          textAlign: "center",
          position: "absolute",
          top: "50%",
          left: "50%",
        }}
      >
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return userAccess ? (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <Container>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<TemplateListPage />} />
                <Route path="template/:id" element={<TemplatePage />} />
                <Route
                  path="add_template"
                  element={
                    <ProtectedRoute>
                      <AdminTemplatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="add_admin"
                  element={
                    <ProtectedRoute>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </Container>
      </Provider>
    </ThemeProvider>
  ) : (
    <Typography variant="h3" textAlign="center">
      У вас нет доступа, обратитесь к вашему менеджеру или администратору
    </Typography>
  );
}

export default App;
