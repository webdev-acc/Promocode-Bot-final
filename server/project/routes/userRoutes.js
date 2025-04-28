const express = require("express");
const router = express.Router();
const {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  checkUserAccess,
  editUser,
} = require("../controllers/userController");

router.post("/newUser", createUser);
router.patch("/updateUser", updateUser);
router.delete("/deleteUser/:name", deleteUser);
router.patch("/editUser/:id", editUser);
router.get("/users", getUsers);
router.get("/user_access/:name/:id", checkUserAccess);

module.exports = router;
