import express from "express";
import { createAdvertiser } from "../controllers/advertiserController.js";

const advertiserRouter = express.Router();

advertiserRouter.post("/submit", createAdvertiser);

export default advertiserRouter;
