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
  getExistingEmptyDraft,
  getPublishedForm,
  publishForm,
  renewExistingEmptyDraft,
  storeInitialDraft,
  updateDraftForm,
  updatePublishedForm,
} from "../controllers/formController.js";
import { validateSession } from "../middleware/validateSession.js";

const router = express.Router();

router.get("/get-all-forms/:sort", validateSession, getAllForms);

router.get("/get-draft-forms", validateSession, getDraftForms);

router.get("/get-published-form/:formId", getPublishedForm);

router.get("/get-draft-form/:formId", validateSession, getDraftForm);

router.get("/get-default-input-types", validateSession, getDefaultInputTypes);

router.get("/get-default-input-properties", validateSession, getDefaultInputProperties);

router.get(
  "/get-default-input-property-options",
  validateSession,
  getDefaultInputPropertyOptions
);

router.get("/check-for-existing-draft", validateSession, checkForExistingDraft);

router.post("/store-initial-draft", validateSession, storeInitialDraft);

router.get("/get-existing-empty-draft", validateSession, getExistingEmptyDraft);

router.post("/renew-existing-empty-draft", validateSession, renewExistingEmptyDraft);

router.put("/update-draft-form", validateSession, updateDraftForm);

router.put("/update-published-form", validateSession, updatePublishedForm);

router.post("/add-new-input-to-form", validateSession, addNewInputToForm);

router.put(
  "/change-input-enabled-status/:inputId",
  validateSession,
  changeInputEnabledStatus
);

router.post("/publish", validateSession, publishForm);

router.put(`/delete-draft-form/:formId`, validateSession, deleteDraftForm);

router.put(`/delete-published-form/:formId`, validateSession, deletePublishedForm);

export default router;
