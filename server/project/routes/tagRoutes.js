const express = require("express");
const router = express.Router();
const {
  getBannerTags,
  getTags,
  createTag,
  deleteTag,
} = require("../controllers/tagController");

router.get("/banner_tags", getBannerTags);
router.get("/tags", getTags);
router.post("/tag", createTag);
router.delete("/tag/:id", deleteTag);

module.exports = router;
