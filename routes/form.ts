import express from "express";
import {
  addNewInputToForm,
  changeInputEnabledStatus,
  checkForExistingDraft,
  deleteDraftForm,
  deletePublishedForm,
  getAllForms,
  getDefaultInputProperties,
  getDefaultInputPropertyOptions,
  getDefaultInputTypes,
  getDraftForm,
  getDraftForms,
  getPublishedForm,
  publishForm,
  storeInitialDraft,
  updateForm,
} from "../controllers/formController.js";
import { validateSession } from "../middleware/validateSession.js";

const router = express.Router();

router.get("/get-all-forms/:userId/:sort", validateSession, getAllForms);

router.get("/get-draft-forms/:userId", validateSession, getDraftForms);

router.get("/get-published-form/:formId", getPublishedForm);

router.get("/get-draft-form/:formId", getDraftForm);

router.get("/get-default-input-types", validateSession, getDefaultInputTypes);

router.get("/get-default-input-properties", validateSession, getDefaultInputProperties);

router.get("/get-default-input-property-options", validateSession, getDefaultInputPropertyOptions);

router.get("/check-for-existing-draft", validateSession, checkForExistingDraft);

router.post("/store-initial-draft", validateSession, storeInitialDraft);

router.put("/update-form", validateSession, updateForm);

router.post("/add-new-input-to-form", validateSession, addNewInputToForm);

router.put("/change-input-enabled-status/:inputId", validateSession, changeInputEnabledStatus);

router.post("/publish", validateSession, publishForm);

router.put(`/delete-draft-form/:formId`, validateSession, deleteDraftForm);

router.put(`/delete-published-form/:formId`, validateSession, deletePublishedForm);

export default router;
