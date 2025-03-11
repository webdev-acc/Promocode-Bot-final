import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
  TextField,
} from "@mui/material";
import InputSelect from "../ui/InputSelect";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";

const TagForm = ({
  newTag,
  setNewTag,
  newTagError,
  successIcon,
  tagOptions,
  handleAddTag,
  field,
  error,
  helperText,
}) => (
  <Accordion sx={{ border: error && "1px solid red" }}>
    <AccordionSummary expandIcon={<ArrowDownwardIcon />}>
      <Typography>Tags</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          error={!!newTagError}
          helperText={newTagError}
          label="New tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
        />
        <Button
          sx={{ height: "60px" }}
          onClick={handleAddTag}
          color={successIcon ? "success" : "info"}
        >
          {successIcon ? (
            <DoneOutlineIcon fontSize="large" />
          ) : (
            <AddCircleIcon fontSize="large" />
          )}
        </Button>
      </Box>
      <InputSelect
        {...field}
        label="Tags"
        options={tagOptions}
        multi
        error={error}
        helperText={helperText}
        existingTags={tagOptions}
      />
    </AccordionDetails>
  </Accordion>
);

export default TagForm;
