import * as React from "react";
import Typography from "@mui/material/Typography";
import { Box, IconButton, Paper, Stack, styled } from "@mui/material";
import { useNavigate } from "react-router";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

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

export default function TemplateCard({
  template,
  removeBtnClick,
  showRemoveBtn,
}) {
  const { url, language, size, type, tags, geo, id, download_count } = template;
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/template/${id}`, { state: template });
  };

  return (
    <Item
      sx={{
        my: 1,
        p: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
      }}
      onClick={handleClick}
    >
      <Stack>
        <img
          src={url}
          alt="Template image"
          style={{
            width: 80,
            height: 80,
            objectFit: "contain",
            imageRendering: "crisp-edges",
          }}
        />
      </Stack>
      <Box>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="caption" noWrap>
            {language}
          </Typography>
        </Stack>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="caption" noWrap>
            {geo}
          </Typography>
        </Stack>
      </Box>
      <Box>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="caption" noWrap>
            {type}
          </Typography>
        </Stack>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="caption" noWrap>
            {size}
          </Typography>
        </Stack>
      </Box>
      <Stack sx={{ minWidth: 0 }}>
        {tags.map((el) => (
          <Typography key={el.id} variant="caption" noWrap>
            #{el.name}
          </Typography>
        ))}
      </Stack>
      <Stack ml={2}>
        <Box
          sx={{
            position: "absolute",
            bottom: 2,
            right: 2,
            color: "white",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" color="info">
            {download_count}
          </Typography>
          <DownloadIcon fontSize="small" color="info" />
        </Box>
        {showRemoveBtn && (
          <IconButton
            onClick={removeBtnClick}
            sx={{ position: "absolute", top: 1, right: 1 }}
          >
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        )}
      </Stack>
    </Item>
  );
}
