import { useState, useEffect } from "react";
import { Fade, Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";

const AlertBox = ({
  shown,
  textInfo,
  icon,
  type = "success",
  duration = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(shown);

  const styles = {
    success: {
      bgcolor: "success.main", // Основной зеленый фон
      iconColor: "white", // Белая иконка
      textColor: "white", // Белый текст
      icon: CheckCircleIcon,
    },
    error: {
      bgcolor: "error.main", // Основной красный фон
      iconColor: "white",
      textColor: "white",
      icon: ErrorIcon,
    },
    info: {
      bgcolor: "info.main", // Основной синий фон
      iconColor: "white",
      textColor: "white",
      icon: InfoIcon,
    },
    warning: {
      bgcolor: "warning.main", // Основной желтый фон
      iconColor: "white",
      textColor: "white",
      icon: WarningIcon,
    },
  };
  const {
    bgcolor,
    iconColor,
    textColor,
    icon: defaultIcon,
  } = styles[type] || styles.success;
  const IconComponent = icon || defaultIcon;

  useEffect(() => {
    setIsVisible(shown);
    if (shown && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [shown, duration]);

  return (
    <Fade in={isVisible} timeout={600}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          bgcolor,
          p: 1,
          borderRadius: 1,
          mt: 2,
          boxShadow: 2,
          position: "absolute",
          top: 1,
          right: 1,
        }}
      >
        {IconComponent && <IconComponent color={iconColor} />}
        <Typography color={textColor} variant="body2">
          {textInfo}
        </Typography>
      </Box>
    </Fade>
  );
};

export default AlertBox;
