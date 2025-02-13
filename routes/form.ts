import express from "express";
import {
  addNewInputToDraftForm,
  addNewInputToPublishedForm,
  changeInputEnabledStatus,
  checkForExistingDraft,
  deleteDraftForm,
  deletePublishedForm,
  getMyForms,
  getDefaultInputProperties,
  getDefaultInputPropertyOptions,
  getDefaultInputTypes,
  getDraftForm,
  getDraftForms,
  getExistingEmptyDraft,
  getPrivacyOptions,
  getPublishedForm,
  publishForm,
  renewExistingEmptyDraft,
  storeInitialDraft,
  updateDraftForm,
  updatePublishedForm,
  submitForm,
  getPrevFormSubmissions,
  getPublicForms,
  getAnsweredForms,
  getInputSubmissions,
  deletePublishedInput,
  getInput,
  getDraftInput,
  attemptPasskeyAccess,
  getResponses,
  getInputType,
  addFormView,
  getRecentFormViews,
  editInput,
  editDraftInput,
} from "../controllers/formController.js";
import { validateSession } from "../middleware/validateSession.js";
import { validateOptionalSession } from "../middleware/validateOptionalSession.js";

const router = express.Router();

router.get("/get-my-forms/:sort", validateSession, getMyForms);

router.get("/get-public-forms/:sort", validateSession, getPublicForms);

router.get("/get-answered-forms/:sort", validateSession, getAnsweredForms);

router.get("/get-draft-forms", validateSession, getDraftForms);

router.get("/get-published-form/:formId", validateOptionalSession, getPublishedForm);

router.get("/get-draft-form/:formId", validateSession, getDraftForm);

router.get("/get-privacy-options", validateSession, getPrivacyOptions);

router.get("/get-default-input-types", validateSession, getDefaultInputTypes);

router.get("/get-default-input-properties", validateSession, getDefaultInputProperties);

router.get(
  "/get-default-input-property-options",
  validateSession,
  getDefaultInputPropertyOptions
);

router.get("/check-for-existing-draft", validateSession, checkForExistingDraft);

router.get("/get-existing-empty-draft", validateSession, getExistingEmptyDraft);

router.get("/get-responses/:formId", validateSession, getResponses);

router.get("/get-prev-form-submissions/:formId", validateSession, getPrevFormSubmissions);

router.get("/get-input-submissions/:submissionId", validateSession, getInputSubmissions);

router.get("/get-input/:inputId", validateSession, getInput);

router.get("/get-draft-input/:inputId", validateSession, getDraftInput);

router.get("/get-input-type/:inputTypeId", validateSession, getInputType);

router.get("/get-recent-form-views", validateSession, getRecentFormViews);

router.post("/store-initial-draft", validateSession, storeInitialDraft);

router.post("/renew-existing-empty-draft", validateSession, renewExistingEmptyDraft);

router.post("/add-new-input-to-draft-form", validateSession, addNewInputToDraftForm);

router.post(
  "/add-new-input-to-published-form",
  validateSession,
  addNewInputToPublishedForm
);

router.post("/edit-input", validateSession, editInput);

router.post("/edit-draft-input", validateSession, editDraftInput);

router.post("/publish", validateSession, publishForm);

router.post("/submit-form", validateSession, submitForm);

router.post("/attempt-passkey-access", validateSession, attemptPasskeyAccess);

router.post("/add-form-view", validateOptionalSession, addFormView);

router.put("/update-draft-form", validateSession, updateDraftForm);

router.put("/update-published-form", validateSession, updatePublishedForm);

router.put(
  "/change-input-enabled-status/:inputId",
  validateSession,
  changeInputEnabledStatus
);

router.put(`/delete-draft-form/:formId`, validateSession, deleteDraftForm);

router.put(`/delete-published-input/:inputId`, validateSession, deletePublishedInput);

router.put(`/delete-published-form/:formId`, validateSession, deletePublishedForm);

export default router;
