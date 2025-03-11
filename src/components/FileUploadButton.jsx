import { Button, Typography } from "@mui/material";
import PhotoSizeSelectActualIcon from "@mui/icons-material/PhotoSizeSelectActual";
import { styled } from "@mui/material";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const FileUploadButton = ({ value, onChange, error, helperText }) => (
  <Button
    component="label"
    variant="outlined"
    tabIndex={-1}
    color={error ? "error" : "primary"}
    sx={{ display: "flex", flexDirection: "column" }}
  >
    <Typography variant="body1" sx={{ display: "flex", gap: 2 }}>
      <PhotoSizeSelectActualIcon />
      Attach file
    </Typography>
    <Typography variant="caption">{value?.name}</Typography>
    <VisuallyHiddenInput
      accept="image/svg+xml"
      type="file"
      onChange={onChange}
    />
    {error && (
      <Typography color="error" variant="caption">
        {helperText}
      </Typography>
    )}
  </Button>
);

export default FileUploadButton;
