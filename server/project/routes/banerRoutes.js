const express = require("express");
const router = express.Router();
const {
  getTemplates,
  deleteTemplate,
  createTemplate,
  updateTemplate,
  getTypes,
  getSizes,
  getTemplateById,
  incrementDownloadCount,
} = require("../controllers/bannerController");
const upload = require("../middleware/upload");

router.get("/templates", getTemplates);
router.get("/templates/:id", getTemplateById);
router.delete("/templates/:bannerId", deleteTemplate);
router.post("/template", upload.single("img"), createTemplate);
router.patch("/template/:id", upload.single("img"), updateTemplate);
router.get("/types", getTypes);
router.get("/sizes", getSizes);
router.post("/banners/:id/download", incrementDownloadCount);

module.exports = router;
