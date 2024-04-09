const express = require("express");
const router = express.Router();

const chitietgiatourController = require("../controllers/chitietgiatour.controller");

router.get("/", chitietgiatourController.getCTGT);
router.get('/ctgt/:id', chitietgiatourController.getCTGTID);
router.post("/createctgt", chitietgiatourController.createCTGT);
router.put("/update/:id", chitietgiatourController.updateCTGT);
router.delete("/delete/:id", chitietgiatourController.deleteCTGT);

module.exports = router;
