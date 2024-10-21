import { Request, Response } from "express";
import { pool } from "../config/database.js";
import {
  publishLinearScales,
  SQL_addDraftInputProperty,
  SQL_addDraftLinearScale,
  SQL_addDraftMultipleChoiceOption,
  SQL_addInputToDraftForm,
  SQL_addInputToPublishedForm,
  SQL_addNewFormSubmission,
  SQL_addPasskeyAttempt,
  SQL_addPublishedInputProperty,
  SQL_addPublishedMultipleChoiceOption,
  SQL_deleteDraftForm,
  SQL_deletePublishedInput,
  SQL_deletePublishedForm,
  SQL_getAllActiveDraftForms,
  SQL_getAllInputProperties,
  SQL_getAllPrivacyOptions,
  SQL_getAnsweredForms,
  SQL_getDefaultInputPropertyOptions,
  SQL_getDraftFormById,
  SQL_getDraftFormInputs,
  SQL_getDraftForms,
  SQL_getDraftInputPropertyValues,
  SQL_getDraftLinearScales,
  SQL_getDraftMultipleChoiceOptions,
  SQL_getExistingDraftForm,
  SQL_getExistingFormDraftInputs,
  SQL_getFormCreatorId,
  SQL_getInput,
  SQL_getInputProperties,
  SQL_getLatestFormSubmission,
  SQL_getMyForms,
  SQL_getPasskeyAttempts,
  SQL_getPropertiesForDraftInput,
  SQL_getPublicForms,
  SQL_getPublishedForm,
  SQL_getPublishedFormByDraftId,
  SQL_getPublishedFormInputPropertyValues,
  SQL_getPublishedFormInputs,
  SQL_getPublishedFormInputsWithAnswers,
  SQL_getPublishedFormInputsWithoutAnswers,
  SQL_getPublishedLinearScales,
  SQL_getPublishedLinearScales2,
  SQL_getPublishedMultipleChoiceOptions,
  SQL_getPublishedMultipleChoiceOptions2,
  SQL_getSingleDraftInput,
  SQL_getSingleInputType,
  SQL_getSubmissionsWithUserInfo,
  SQL_getSubmittedInputs,
  SQL_getSubmittedInputValues,
  SQL_getSubmittedMultipleChoiceOptions,
  SQL_insertNewDraftForm,
  SQL_publishDraftForm,
  SQL_publishDraftInputProperties,
  SQL_publishDraftInputs,
  SQL_publishMultipleChoiceOptions,
  SQL_renewDraftForm,
  SQL_submitInputValue,
  SQL_submitMultipleChoiceOption,
  SQL_updateActiveStatusOnInput,
  SQL_updateDraftForm,
  SQL_updateDraftInput,
  SQL_updatePublishedForm,
  SQL_updatePublishedInput,
  updatePublishedStatusOfDraftForm,
  SQL_addFormView,
  SQL_getRecentFormViews,
} from "../services/sqlQueries.js";
import {
  InputTypePropertyOptionType,
  InputTypePropertyType,
  MultipleChoiceOptionType,
} from "../types/types";
import { hashify } from "../utils/hashify.js";
import { parseErrorMessage } from "../utils/parseErrorMessage.js";

export const getMyForms = async (req: Request, res: Response) => {
  try {
    const { rows: myPublishedAndDraftForms } = await pool.query(
      SQL_getMyForms(req.params.sort),
      [req.user.id]
    );

    return res.status(200).send(myPublishedAndDraftForms);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getPublicForms = async (req: Request, res: Response) => {
  try {
    // TODO - Impliment
    const { rows: publicForms } = await pool.query(SQL_getPublicForms(req.params.sort), [
      req.user.id,
    ]);

    return res.status(200).send(publicForms);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getAnsweredForms = async (req: Request, res: Response) => {
  try {
    // TODO - Impliment
    const { rows: answeredForms } = await pool.query(
      SQL_getAnsweredForms(req.params.sort),
      [req.user.id]
    );

    return res.status(200).send(answeredForms);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDraftForms = async (req: Request, res: Response) => {
  try {
    const { rows: myDraftForms } = await pool.query(SQL_getDraftForms, [
      req.params.userId,
    ]);

    return res.status(200).send(myDraftForms);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDraftForm = async (req: Request, res: Response) => {
  try {
    const {
      rows: [draftFormById],
    } = await pool.query(SQL_getDraftFormById, [req.params.formId]);

    if (!draftFormById) {
      return res.status(200).send([]);
    }

    const { rows: draftFormInputs } = await pool.query(SQL_getDraftFormInputs, [
      draftFormById.id,
    ]);

    const { rows: draftInputPropertyValues } = await pool.query(
      SQL_getDraftInputPropertyValues,
      [form.id]
    );

    let propertiesObj: {
      [key: string]: any;
    } = {};

    draftInputPropertyValues.forEach((property) => {
      if (!propertiesObj[`${property.created_input_id}`])
        propertiesObj[`${property.created_input_id}`] = {};
      propertiesObj[`${property.created_input_id}`][property.property_key] = property;
    });

    let modifiedDraftFormInputs = draftFormInputs.map((input) => {
      return {
        ...input,
        properties: propertiesObj[input.id],
      };
    });

    const { rows: multipleChoiceOptions } = await pool.query(
      SQL_getDraftMultipleChoiceOptions,
      [form.id]
    );

    const multipleChoiceOptionsObj: { [key: string]: MultipleChoiceOptionType[] } = {};

    multipleChoiceOptions.forEach((option) => {
      if (!multipleChoiceOptionsObj[`${option.input_id}`])
        multipleChoiceOptionsObj[`${option.input_id}`] = [];

      option.checked = false;
      multipleChoiceOptionsObj[`${option.input_id}`].push(option);
    });

    modifiedDraftFormInputs = modifiedDraftFormInputs.map((input) => {
      return {
        ...input,
        options: multipleChoiceOptionsObj[input.id] || [],
      };
    });

    const { rows: linearScales } = await pool.query(SQL_getDraftLinearScales, [form.id]);

    const linearScalesObj = {};

    linearScales.forEach((linearScale) => {
      linearScalesObj[linearScale.input_id] = {
        min: linearScale.min,
        max: linearScale.max,
      };
    });

    modifiedDraftFormInputs = modifiedDraftFormInputs.map((input) => {
      return {
        ...input,
        linearScale: linearScalesObj[input.id] || null,
      };
    });

    return res.status(200).send({
      form: draftFormById,
      inputs: modifiedDraftFormInputs,
      propertiesObj,
    });
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getPublishedForm = async (req: Request, res: Response) => {
  try {
    const {
      rows: [publishedForm],
    } = await pool.query(SQL_getPublishedForm, [req.params.formId]).catch((error) => {
      console.log("At get form info", error);
    });

    if (!publishedForm) throw new Error("Published form was not found");

    const needsPasskey = publishedForm.needs_passkey;

    if (publishedForm.created_by_id !== req.user?.id && needsPasskey) {
      const {
        rows: [successfulPasskeyAttempt],
      } = await pool
        .query(SQL_getPasskeyAttempts, [req.params.formId, req.user.id])
        .catch((error) => {
          console.log("At get passkey attempts", error);
        });

      if (!successfulPasskeyAttempt) {
        return res.status(200).json({
          requiresPasscode: true,
          message: "Must enter passcode to access form",
        });
      }
    }

    const {
      rows: [latestSubmission],
    } = await pool
      .query(SQL_getFormSubmissions, [req.params.formId, req.user.id])
      .catch((error) => {
        console.log("At get form submissions", error);
      });

    const submissionId = latestSubmission?.id;

    let inputs;

    if (req.user?.id) {
      // Get inputs
      const paramsArr = [form.id];
      if (submissionId) paramsArr.push(submissionId);

      const { rows: publishedFormInputs } = await pool
        .query(SQL_getPublishedFormInputsWithAnswers(submissionId), paramsArr)
        .catch((error) => {
          console.log("At get inputs", error);
        });

      inputs = publishedFormInputs;
    } else {
      // Get inputs
      const { rows: publishedFormInputs } = await pool.query(
        SQL_getPublishedFormInputsWithoutAnswers,
        [form.id]
      );

      inputs = publishedFormInputs;
    }

    const { rows: publishedFormInputPropertyValues } = await pool.query(
      SQL_getPublishedFormInputPropertyValues,
      [form.id]
    );

    let propertiesObj: {
      [key: string]: any;
    } = {};

    publishedFormInputPropertyValues.forEach((property) => {
      if (!propertiesObj[`${property.created_input_id}`])
        propertiesObj[`${property.created_input_id}`] = {};
      propertiesObj[`${property.created_input_id}`][property.property_key] = property;
    });

    inputs = inputs.map((input) => {
      return {
        ...input,
        properties: propertiesObj[input.id],
      };
    });

    let paramsArr = [form.id, req.user?.id || null, submissionId || null];

    const { rows: publishedMultipleChoiceOptions } = await pool
      .query(SQL_getPublishedMultipleChoiceOptions(submissionId), paramsArr)
      .catch((error) => {
        console.log("At multiple choice", error);
      });

    const multipleChoiceOptionsObj: { [key: string]: MultipleChoiceOptionType[] } = {};

    publishedMultipleChoiceOptions.forEach((option) => {
      if (!multipleChoiceOptionsObj[`${option.input_id}`])
        multipleChoiceOptionsObj[`${option.input_id}`] = [];

      // option.checked = false;
      multipleChoiceOptionsObj[`${option.input_id}`].push(option);
    });

    inputs = inputs.map((input) => {
      return {
        ...input,
        options: multipleChoiceOptionsObj[input.id] || [],
      };
    });

    paramsArr = [publishedForm.id];
    if (submissionId) paramsArr.push(submissionId);

    const { rows: publishedLinearScales } = await pool
      .query(SQL_getPublishedLinearScales(submissionId), paramsArr)
      .catch((error) => {
        console.log("At linear scale", error);
      });

    const linearScalesObj = {};

    publishedLinearScales.forEach((linearScale) => {
      linearScalesObj[linearScale.input_id] = {
        min: linearScale.min,
        existingValue: linearScale.existing_value,
        max: linearScale.max,
      };
    });

    inputs = inputs.map((input) => {
      return {
        ...input,
        linearScale: linearScalesObj[input.id] || null,
      };
    });

    return res.status(200).send({
      form: publishedForm,
      inputs,
    });
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getResponses = async (req: Request, res: Response) => {
  try {
    // make sure user is admin of form
    const {
      rows: [userThatCreatedForm],
    } = await pool.query(SQL_getFormCreatorId, [req.params.formId]).catch((error) => {
      console.log("At get form info", error);
    });

    if (!userThatCreatedForm && userThatCreatedForm !== 0) {
      return res.status(404).json({ message: "Form not found" });
    }

    const { created_by_id } = userThatCreatedForm;

    if (created_by_id !== req.user.id) {
      return res
        .status(200)
        .json({ message: "You are not authorized to view responses to this form" });
    }

    // get inputs (active and inactive)
    const { rows: inputsForForm } = await pool
      .query(SQL_getPublishedFormInputs, [req.params.formId])
      .catch((error) => {
        console.log("At get author inputs", error);
      });

    if (inputsForForm.length === 0) {
      return res
        .status(200)
        .json({ message: "No inputs to respond to were found for this form" });
    }

    // get submitted inputs
    const { rows: submittedInputRows } = await pool
      .query(SQL_getSubmittedInputs, [req.params.formId])
      .catch((error) => {
        console.log("At get submitted inputs", error);
      });

    if (submittedInputRows.length === 0) {
      return res.status(200).json({
        inputs: inputsForForm,
        responses: [],
        message: "No submitted inputs were found for this form",
      });
    }

    // get multiple choice options
    const { rows: mcOptionRows } = await pool
      .query(SQL_getPublishedMultipleChoiceOptions2, [req.params.formId])
      .catch((error) => {
        console.log("At get multiple choice options", error);
      });

    const mcOptionsObj: { [key: string]: { [key: string]: MultipleChoiceOptionType[] } } =
      {};

    mcOptionRows.forEach((option) => {
      const subID = option.submission_id;
      const inputID = option.input_id;

      if (!mcOptionsObj[subID]) mcOptionsObj[subID] = {};
      if (!mcOptionsObj[subID][inputID]) mcOptionsObj[subID][inputID] = [];

      mcOptionsObj[subID][inputID].push(option);
    });

    const { rows: linearScaleSubmissionRows } = await pool.query(
      SQL_getPublishedLinearScales2,
      [req.params.formId]
    );

    const linearScalesObj = {};

    linearScaleSubmissionRows.forEach((linScaleSub) => {
      const subID = linScaleSub.submission_id;
      const inputID = linScaleSub.input_id;

      if (!linearScalesObj[subID]) linearScalesObj[subID] = {};
      if (!linearScalesObj[subID][inputID]) linearScalesObj[subID][inputID] = [];

      linearScalesObj[subID][inputID] = {
        min: linScaleSub.min,
        existingValue: linScaleSub.value,
        max: linScaleSub.max,
      };
    });

    const inputsBySubID = {};

    submittedInputRows.forEach((response) => {
      const subID = response.submission_id;

      response.options = mcOptionsObj[subID]
        ? mcOptionsObj[subID][response.created_input_id]
        : [];
      response.linearScale = linearScalesObj[subID]
        ? linearScalesObj[subID][response.created_input_id]
        : {};

      if (!inputsBySubID[subID]) inputsBySubID[subID] = [];
      inputsBySubID[subID].push(response);
    });

    // get submission with user info
    const { rows: submissionsList } = await pool
      .query(SQL_getSubmissionsWithUserInfo, [req.params.formId])
      .catch((error) => {
        console.log("At get form submissions", error);
      });

    if (submissionsList.length === 0) {
      return res.status(200).json({
        inputs,
        responses: [],
        message: "No form submission found for this form",
      });
    }

    res.json({ submissionsList, inputsBySubID, mcOptionsObj });
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDefaultInputTypes = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const { rows: defaultInputTypes } = await pool.query(`
      select * from input_types  
    `);

    if (!defaultInputTypes) throw new Error("No default input types were found");
    return res.status(200).send(defaultInputTypes);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getPrivacyOptions = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const { rows: privacyOptions } = await pool.query(SQL_getAllPrivacyOptions);

    return res.status(200).send(privacyOptions);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDefaultInputProperties = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const { rows: defaultInputProperties } = await pool.query(SQL_getAllInputProperties);

    if (!defaultInputProperties.length)
      throw new Error("There was an error fetching form item type properties");

    const modifiedDefaultInputProperties = defaultInputProperties.map(
      (row: InputTypePropertyType) => ({
        ...row,
        ...(row.property_type !== "radio" && {
          value: "",
        }),
      })
    );

    const hashifiedDefaultInputProperties = hashify(
      modifiedDefaultInputProperties,
      "input_type_id"
    );

    return res.status(200).send(hashifiedDefaultInputProperties);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDefaultInputPropertyOptions = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const { rows: defaultInputPropertyOptions } = await pool.query(
      SQL_getDefaultInputPropertyOptions
    );

    if (!defaultInputPropertyOptions)
      throw new Error("There was an error fetching form item type properties");

    let modifiedDefaultInputPropertyOptions = defaultInputPropertyOptions.map(
      (row: InputTypePropertyOptionType): InputTypePropertyOptionType => ({
        ...row,
        checked: false,
      })
    );

    const hashifiedDefaultInputPropertyOptions = hashify(
      modifiedDefaultInputPropertyOptions,
      "property_id"
    );

    return res.status(200).send(hashifiedDefaultInputPropertyOptions);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const checkForExistingDraft = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const { userId } = req.query;

    const draft: {
      form: {
        id: number;
        title: string;
        description: string;
        passkey: string;
        is_deleted: boolean;
        created_by_id: number;
        created_at: string;
        modified_by_id: number;
        modified_at: string;
      } | null;
      inputs: object[];
    } = {
      form: null,
      inputs: [],
    };

    const { rows: existingFormDrafts } = await pool.query(SQL_getAllActiveDraftForms, [
      userId,
    ]);

    draft.form = existingFormDrafts[0];

    if (!draft.form) {
      return res.status(200).send(draft);
    }

    const { rows: existingFormDraftInputs } = await pool.query(
      SQL_getExistingFormDraftInputs,
      [draft.form.id]
    );

    draft.inputs = existingFormDraftInputs;

    return res.status(200).send(draft);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getExistingEmptyDraft = async (req: Request, res: Response) => {
  try {
    const { rows: existingDraft } = await pool.query(SQL_getExistingDraftForm, [
      req.user.id,
    ]);

    return res.status(200).send(existingDraft);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getPrevFormSubmissions = async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;

    if (!formId) throw new Error("Form ID not provided");

    const { rows: formSubmissions } = await pool.query(SQL_getLatestFormSubmission, [
      formId,
      req.user.id,
    ]);

    return res.status(200).send(formSubmissions);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getInputSubmissions = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;

    if (!submissionId) throw new Error("No submission ID was provided in controller");

    const { rows: submittedInputValues } = await pool.query(SQL_getSubmittedInputValues, [
      req.user.id,
      submissionId,
    ]);

    const { rows: submittedMultipleChoiceOptions } = await pool.query(
      SQL_getSubmittedMultipleChoiceOptions,
      [submissionId]
    );

    let latestInputSubmissions = null;
    let multipleChoiceSubmissions = null;

    submittedInputValues.forEach((inputSubmission) => {
      if (!latestInputSubmissions) latestInputSubmissions = {};
      latestInputSubmissions[inputSubmission.created_input_id] = inputSubmission;
    });

    submittedMultipleChoiceOptions.forEach((multipleChoiceSubmission) => {
      if (!multipleChoiceSubmissions) multipleChoiceSubmissions = {};
      multipleChoiceSubmissions[multipleChoiceSubmission.input_id] =
        multipleChoiceSubmission;
    });

    return res.json({
      inputSubmissions: latestInputSubmissions,
      multipleChoiceSubmissions,
    });
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getInput = async (req: Request, res: Response) => {
  try {
    const { inputId } = req.params;

    if (!inputId) throw new Error("No input id was given");

    const { rows: publishedAuthorInputs } = await pool.query(SQL_getInput, [
      inputId,
      req.user.id,
    ]);

    if (publishedAuthorInputs.length === 0) throw new Error("No input found");

    const inputInfo = publishedAuthorInputs[0];

    const { rows: inputProperties } = await pool.query(SQL_getInputProperties, [
      inputInfo.id,
    ]);

    return res.status(200).send({ info: inputInfo, properties: inputProperties });
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDraftInput = async (req: Request, res: Response) => {
  try {
    const { inputId } = req.params;

    if (!inputId) throw new Error("No draft input id was given");

    const { rows: draftAuthorInputs } = await pool.query(SQL_getSingleDraftInput, [
      inputId,
      req.user.id,
    ]);

    if (!draftAuthorInputs[0]) throw new Error("No input found");

    const inputInfo = draftAuthorInputs[0];

    const { rows: draftAuthorInputPropertyValues } = await pool.query(
      SQL_getPropertiesForDraftInput,
      [inputInfo.id]
    );

    const properties = draftAuthorInputPropertyValues;

    return res.status(200).send({ info: inputInfo, properties });
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getInputType = async (req: Request, res: Response) => {
  try {
    const { inputTypeId } = req.params;

    if (!inputTypeId) throw new Error("No input type id was given");

    const {
      rows: [inputType],
    } = await pool.query(SQL_getSingleInputType, [inputTypeId]);

    if (!inputType) throw new Error("There was an error getting the input type");

    return res.status(200).send(inputType);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const renewExistingEmptyDraft = async (req: Request, res: Response) => {
  try {
    const {
      rows: [updatedExistingEmptyDraft],
    } = await pool.query(SQL_renewDraftForm, [req.body.draftFormId]);

    if (!updatedExistingEmptyDraft)
      throw new Error("There was an error renewing the existing draft");

    return res.status(200).send(updatedExistingEmptyDraft);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const storeInitialDraft = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const {
      rows: [newDraftForm],
    } = await pool.query(SQL_insertNewDraftForm, [req.user.id]);

    if (!newDraftForm) throw new Error("No initially draft form was returned");

    return res.status(200).send(newDraftForm);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

interface UpdateDraftBody {
  formId: string;
  title: string;
  description: string;
  inputs: {
    inputType: {
      id: number;
      name: string;
      description: string;
    };
    metadata: {
      name: string;
      description: string;
    };
    properties: {
      id: number;
      input_type_id: 36;
      property_name: string;
      property_description: string;
      property_type: string;
      value: string;
    }[];
  }[];
  privacyId: number;
  privacyPasskey: string;
  canResubmit: boolean;
}

interface UpdateDraftRequest extends Request {
  body: UpdateDraftBody;
}

export const updateDraftForm = async (
  req: UpdateDraftRequest,
  res: Response
): Promise<object | void> => {
  try {
    const {
      rows: [updatedDraftForm],
    } = await pool.query(SQL_updateDraftForm, [
      req.body.title,
      req.body.description,
      req.body.privacyPasskey,
      req.body.canResubmit,
      req.user.id,
      req.body.privacyId,
      req.body.formId,
    ]);

    if (!updatedDraftForm) throw new Error("form draft was not updated");

    return res.status(200).send(updatedDraftForm);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const updatePublishedForm = async (
  req: UpdateDraftRequest,
  res: Response
): Promise<object | void> => {
  try {
    const {
      rows: [updatedPublishedForm],
    } = await pool.query(SQL_updatePublishedForm, [
      req.body.title,
      req.body.description,
      req.body.privacyPasskey,
      req.body.privacyId,
      req.user.id,
      req.body.formId,
    ]);

    if (!updatedPublishedForm) throw new Error("published form was not updated");

    return res.status(200).send(updatedPublishedForm);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const addNewInputToDraftForm = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    if (
      req.body.inputTypeId === 7 && // multiple choice
      req.body.options.length !== 0 &&
      req.body.options.filter((option) => option.label === "").length !== 0
    ) {
      throw new Error("Cannot add multiple choice option without a label");
    }

    const {
      rows: [createdDraftInput],
    } = await pool.query(SQL_addInputToDraftForm, [
      req.body.inputTypeId,
      req.body.formId,
      req.body.inputMetadataQuestion,
      req.body.inputMetadataDescription,
      req.body.isRequired,
      req.user.id,
    ]);

    if (!createdDraftInput) throw new Error("No input was added to draft form");

    let numCustomProperties = 0;
    let numMultipleChoiceOptions = 0;

    if (req.body.options && req.body.inputTypeId === 7 /* multiple choice */) {
      numMultipleChoiceOptions = req.body.options.length;

      req.body.options.forEach(async (option, i: number) => {
        await pool.query(SQL_addDraftMultipleChoiceOption, [
          createdDraftInput.id,
          option.label,
          req.user.id,
        ]);
      });
    }

    if (req.body.inputTypeId === 6 /** Linear Scale */) {
      await pool.query(SQL_addDraftLinearScale, [
        createdDraftInput.id,
        req.body.linearScale.min,
        req.body.linearScale.max,
        req.user.id,
      ]);
    }

    if (req.body.properties) {
      req.body.properties.forEach(async (property, i: number) => {
        await pool.query(SQL_addDraftInputProperty, [
          createdDraftInput.id,
          property.id,
          createdDraftInput.input_type_id,
          property.value,
          req.user.id,
        ]);

        if (property.value != null && property.value != "") numCustomProperties += 1;

        if (i == req.body.properties.length - 1) {
          return res.status(200).send({
            ...createdDraftInput,
            num_custom_properties: numCustomProperties,
            num_multiple_choice_options: numMultipleChoiceOptions,
          });
        }
      });
    } else {
      return res.status(200).send({
        ...createdDraftInput,
        num_custom_properties: 0,
        num_multiple_choice_options: numMultipleChoiceOptions,
      });
    }
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const addNewInputToPublishedForm = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    if (
      req.body.inputTypeId === 7 && // multiple choice
      req.body.options.length !== 0 &&
      req.body.options.filter((option) => option.label === "").length !== 0
    ) {
      throw new Error("Cannot add multiple choice option without a label");
    }

    const {
      rows: [createdPublishedInput],
    } = await pool.query(SQL_addInputToPublishedForm, [
      req.body.inputTypeId,
      req.body.formId,
      req.body.inputMetadataQuestion,
      req.body.inputMetadataDescription,
      req.body.isRequired,
      req.user.id,
    ]);

    let numCustomProperties = 0;
    let numMultipleChoiceOptions = 0;

    if (req.body.options && req.body.inputTypeId === 7 /* multiple choice */) {
      numMultipleChoiceOptions = req.body.options.length;

      req.body.options.forEach(async (option, i: number) => {
        await pool.query(SQL_addPublishedMultipleChoiceOption, [
          createdPublishedInput.id,
          option.label,
          req.user.id,
        ]);
      });
    }

    if (req.body.properties) {
      req.body.properties.forEach(async (property, i: number) => {
        await pool.query(SQL_addPublishedInputProperty, [
          createdPublishedInput.id,
          property.id,
          createdPublishedInput.input_type_id,
          property.value,
          req.user.id,
        ]);

        if (property.value != null && property.value != "") numCustomProperties += 1;

        if (i == req.body.properties.length - 1) {
          return res.status(200).send({
            ...createdPublishedInput,
            num_custom_properties: numCustomProperties,
            num_multiple_choice_options: numMultipleChoiceOptions,
          });
        }
      });
    } else {
      return res.status(200).send({
        ...createdPublishedInput,
        num_custom_properties: 0,
        num_multiple_choice_options: numMultipleChoiceOptions,
      });
    }
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const editInput = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    if (!input)
      throw new Error("There was no input included in request body while trying to edit");

    const { id, metadata_question, metadata_description, is_active, is_required } =
      input.info;

    const {
      rows: [updatedPublishedInput],
    } = await pool.query(SQL_updatePublishedInput, [
      metadata_question,
      metadata_description,
      is_active,
      is_required,
      req.user.id,
      id,
    ]);

    if (!updatedPublishedInput) throw new Error("There was an error updating the input");

    return res.status(200).send(updatedPublishedInput);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const editDraftInput = async (req: Request, res: Response) => {
  try {
    const input = req.body;

    if (!input)
      throw new Error(
        "There was no input included in request body while trying to delete"
      );

    const { metadata_question, metadata_description, is_active, is_required } =
      input.info;

    const {
      rows: [updatedDraftInput],
    } = await pool.query(SQL_updateDraftInput, [
      metadata_question,
      metadata_description,
      is_active,
      is_required,
      req.user.id,
    ]);

    return res.status(200).send(updatedDraftInput);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const changeInputEnabledStatus = async (req: Request, res: Response) => {
  try {
    const {
      rows: [updatedInput],
    } = await pool.query(SQL_updateActiveStatusOnInput(req.body.isDraft), [
      req.body.newActiveStatus,
      req.params.inputId,
    ]);

    if (!updatedInput) throw new Error("Input was not updated");

    return res.status(200).send(updatedInput);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const publishForm = async (req: Request, res: Response) => {
  try {
    const {
      rows: [existingPublishedForm],
    } = await pool.query(SQL_getPublishedFormByDraftId, [req.body.draftFormId]);

    if (!existingPublishedForm /* if not already in forms table */) {
      const {
        rows: [newlyPublishedForm],
      } = await pool.query(SQL_publishDraftForm, [req.body.draftFormId, req.user.id]);

      if (!newlyPublishedForm) throw new Error("Form was not published");

      const { rowCount } = await pool.query(updatePublishedStatusOfDraftForm, [
        req.body.draftFormId,
      ]);

      if (rowCount === 0)
        throw new Error("There was an error updating the draft's is_published property.");

      const { rows: newlyCreatedPublishedInputs } = await pool.query(
        SQL_publishDraftInputs,
        [newlyPublishedForm.id, req.user.id, newlyPublishedForm.draft_id]
      );

      let insertedPropertyInputs = 0;

      let alreadySentToClient = false;

      newlyCreatedPublishedInputs.forEach(async (input, i) => {
        await pool.query(SQL_publishDraftInputProperties, [
          input.id,
          req.user.id,
          newForm.draft_id,
          input.draft_input_id,
        ]);

        if (input.input_type_id === 6 /** Linear Scale */) {
          await pool.query(publishLinearScales, [
            input.id,
            req.user.id,
            newForm.draft_id,
            input.draft_input_id,
          ]);
        }

        if (input.input_type_id === 7 /** Multiple choice */) {
          await pool.query(SQL_publishMultipleChoiceOptions, [
            input.id,
            req.user.id,
            newlyPublishedForm.draft_id,
            input.draft_input_id,
          ]);
        }

        insertedPropertyInputs += 1;

        if (insertedPropertyInputs === newlyCreatedPublishedInputs.length) {
          alreadySentToClient = true;
          return res.status(200).send(newlyPublishedForm);
        }
      });

      if (insertedPropertyInputs === 0 && !newlyCreatedPublishedInputs.length) {
        return res.status(200).send(newlyPublishedForm);
      }
    } else {
      return res.status(200).send(existingPublishedForm);
    }
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const attemptPasskeyAccess = async (req: Request, res: Response) => {
  try {
    if (!req.body.formId) throw new Error("No form ID provided, cancelling...");
    if (!req.body.passkey) throw new Error("No passkey provided, cancelling...");

    const {
      rows: [matchingForm],
    } = await pool.query(
      `
       
    `,
      [req.body.formId]
    );

    if (!matchingForm)
      throw new Error("Did not find a form matching the provided form ID");

    const attemptValid = matchingForm.passkey === req.body.passkey;

    await pool.query(SQL_addPasskeyAttempt, [req.body.formId, req.user.id, attemptValid]);

    if (!attemptValid) throw new Error("Passkey did not match");

    return res.status(200).send(matchingForm);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const deleteDraftForm = async (req: Request, res: Response) => {
  try {
    if (!req.params.formId) throw new Error("No form ID provided, cancelling deletion");

    const {
      rows: [updatedDraftForm],
    } = await pool.query(SQL_deleteDraftForm, [req.params.formId]);

    if (!updatedDraftForm) throw new Error("There was an error deleting this draft form");

    return res.status(200).send(updatedDraftForm);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const deletePublishedInput = async (req: Request, res: Response) => {
  try {
    if (!req.params.inputId) throw new Error("No input id provided, cancelling deletion");

    const {
      rows: [updatedPublishedInput],
    } = await pool.query(SQL_deletePublishedInput, [req.params.inputId]);

    if (!updatedPublishedInput)
      throw new Error("There was an error deleting this draft form");

    return res.status(200).send(updatedPublishedInput);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const submitForm = async (req: Request, res: Response) => {
  try {
    const {
      rows: [newFormSubmission],
    } = await pool.query(SQL_addNewFormSubmission, [req.body.formId, req.user.id]);

    if (!newFormSubmission) throw new Error("No new form submission was returned");

    req.body.inputs.forEach(async (input) => {
      if (input.input_type_id === 6 /** Linear Scale */) {
        await pool.query(SQL_submitLinearScale, [
          input.id,
          newFormSubmission.id,
          input.value,
          req.user.id,
        ]);
      } else if (input.input_type_id === 7 /** Multiple choice */) {
        const selectedOptions = input.options.filter((option) => option.checked);

        selectedOptions.forEach(async (option) => {
          await pool.query(SQL_submitMultipleChoiceOption, [
            option.input_id,
            newFormSubmission.id,
            option.id,
            req.user.id,
          ]);
        });
      }
      const {
        rows: [submittedInputValues],
      } = await pool.query(SQL_submitInputValue, [
        newFormSubmission.id,
        input.id,
        input.value,
        req.user.id,
      ]);

      if (!submittedInputValues)
        throw new Error("There was an issue inserting the input values");
    });

    return res.status(200).send(newFormSubmission);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const deletePublishedForm = async (req: Request, res: Response) => {
  try {
    if (!req.params.formId) throw new Error("No form ID provided, cancelling deletion");

    const {
      rows: [updatedPublishedForm],
    } = await pool.query(SQL_deletePublishedForm, [req.params.formId]);

    if (!updatedPublishedForm)
      throw new Error("There was an error deleting this published form");

    return res.status(200).send(updatedPublishedForm);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const addFormView = async (req: Request, res: Response) => {
  try {
    if (!req.body.formId) throw new Error("No form ID provided, cancelling view add");

    await pool.query(SQL_addFormView, [req.body.formId, req.user?.id || null]);

    return res.status(200).json({ message: "View successfully added" });
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getRecentFormViews = async (req: Request, res: Response) => {
  try {
    const { rows: recentFormViews } = await pool.query(SQL_getRecentFormViews, [
      req.user?.id,
    ]);

    return res.status(200).status(200).send(recentFormViews);
  } catch (error) {
    console.error(error);
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};
