import { Container } from "@mui/material";
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

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

function App() {
  return (
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
  );
}

export default App;
