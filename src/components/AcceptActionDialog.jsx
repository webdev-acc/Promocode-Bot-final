import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";

const AcceptActionDialog = ({ open, handleClose, target, handleAccept }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Вы уверены, что хотите удалить {target}?</DialogTitle>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Отмена
        </Button>
        <Button onClick={handleAccept} color="error">
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AcceptActionDialog;
