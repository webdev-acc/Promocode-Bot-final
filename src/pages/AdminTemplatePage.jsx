import { useState } from "react";
import AddTemplateForm from "../components/AddTemplateForm";
import { AppBar, Box, Tab, Tabs } from "@mui/material";
import TagsListControl from "../components/TagsListControl";

export const AdminTemplatePage = () => {
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box>
      <AppBar position="static">
        <Tabs
          value={tab}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Tempalate form" value={0} />
          <Tab label="Tags list" value={1} />
        </Tabs>
      </AppBar>
      {tab === 0 && <AddTemplateForm />}
      {tab === 1 && <TagsListControl />}
    </Box>
  );
};

export default AdminTemplatePage;
