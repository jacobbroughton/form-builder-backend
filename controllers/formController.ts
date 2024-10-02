import { Request, Response } from "express";
import { pool } from "../config/database.js";
import {
  GenericQuery,
  InputTypePropertyType,
  InputTypePropertyOptionType,
} from "../types/types.js";
import { hashify } from "../utils/hashify.js";
import { parseErrorMessage } from "../utils/parseErrorMessage.js";

export const getMyForms = async (req: Request, res: Response) => {
  try {
    // TODO - Impliment
    const result = await pool.query(
      `
      with public as (
      select * from forms
      where created_by_id = $1
      and is_deleted = false
      --order by modified_at, created_at desc
    ) ,
    draft as (
      select * from draft_forms
        where created_by_id = $1
        and is_published = false
        and is_deleted = false
        --order by modified_at desc, created_at desc
    )
     
    select * from (
      select 
        id, 
        --draft_id, 
        title, 
        description, 
        passkey, 
        is_deleted, 
        --published_by_id,
        published_at relevant_dt, 
        created_by_id, 
        created_at, 
        modified_by_id, 
        modified_at,
        false is_draft
      from public 
      union all 
      select 
        id, 
        title, 
        description, 
        passkey, 
        --is_published, 
        is_deleted, 
        created_at relevant_dt,
        created_by_id,
        created_at, 
        modified_by_id, 
        modified_at,
        true is_draft
        from draft
    ) combined
     order by ${
       req.params.sort === "alphabetical-a-z"
         ? "combined.title asc"
         : req.params.sort === "alphabetical-z-a"
         ? "combined.title desc"
         : req.params.sort === "date-new-old"
         ? "combined.modified_at desc, combined.created_at desc"
         : req.params.sort === "date-old-new"
         ? "combined.modified_at asc, combined.created_at asc"
         : "combined.modified_at asc, combined.created_at asc"
     }
    `,
      [req.user.id]
    );

    if (!result) throw new Error("There was an error fetching published forms");

    res.send(result.rows);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getPublicForms = async (req: Request, res: Response) => {
  try {
    // TODO - Impliment
    const result = await pool.query(
      `
    select 
      id,
      draft_id,
      title,
      description,
      passkey,
      privacy_id,
      is_deleted,
      published_by_id,
      published_at relevant_dt,
      created_by_id,
      created_at,
      modified_by_id,
      modified_at
    from forms
    where is_deleted = false
    and privacy_id = 1 -- public
     and created_by_id <> $1
     order by ${
       req.params.sort === "alphabetical-a-z"
         ? "title asc"
         : req.params.sort === "alphabetical-z-a"
         ? "title desc"
         : req.params.sort === "date-new-old"
         ? "modified_at desc, created_at desc"
         : req.params.sort === "date-old-new"
         ? "modified_at asc, created_at asc"
         : "modified_at asc, created_at asc"
     }
    `,
      [req.user.id]
    );

    if (!result) throw new Error("There was an error fetching published forms");

    res.send(result.rows);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getAnsweredForms = async (req: Request, res: Response) => {
  try {
    // TODO - Impliment
    const result = await pool.query(
      `
    select 
      a.id,
      a.draft_id,
      a.title,
      a.description,
      a.passkey,
      a.privacy_id,
      a.is_deleted,
      a.published_by_id,
      b.created_at relevant_dt,
      a.created_by_id,
      a.created_at,
      a.modified_by_id,
      a.modified_at
    from forms a
    inner join form_submissions b
    on a.id = b.form_id
    and b.id = (
      select id from form_submissions
      where form_id = b.form_id
      order by created_at desc
      limit 1
    )
    where a.is_deleted = false
     and b.created_by_id = $1
     and a.created_by_id <> $1
     order by ${
       req.params.sort === "alphabetical-a-z"
         ? "a.title asc"
         : req.params.sort === "alphabetical-z-a"
         ? "a.title desc"
         : req.params.sort === "date-new-old"
         ? "b.created_at desc"
         : req.params.sort === "date-old-new"
         ? "b.created_at asc"
         : "b.created_at asc"
     }
      
    `,
      [req.user.id]
    );

    if (!result) throw new Error("There was an error fetching published forms");

    res.send(result.rows);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDraftForms = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
        select * from draft_forms
        where created_by_id = $1
        and is_published = false
        and is_deleted = false
        order by modified_at desc, created_at desc
      `,
      [req.params.userId]
    );

    if (!result) throw new Error("There was an error fetching draft forms");

    res.send(result.rows);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getPublishedForm = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      select * from forms
      where id = $1
    `,
      [req.params.formId]
    );

    if (!result) throw new Error("There was an error getting this form");

    if (!result.rows[0]) throw new Error("No form was found");

    const form = result.rows[0];

    // Get inputs
    const result2 = await pool.query(
      `
      select a.*, 
      b.name input_type_name,
      b.description input_type_description,
      c.value existing_answer
      from author_inputs a
      inner join input_types b
      on a.input_type_id = b.id
      left join submitted_input_values c
      on a.id = c.created_input_id
      and c.submission_id = (
        select id from form_submissions 
        where form_id = $1 
        and created_by_id = $2
        order by created_at desc
        limit 1
      )
      where form_id = $1
      and is_deleted = false
      and is_active = true
    `,
      [form.id, req.user.id]
    );

    if (!result2)
      throw new Error("Something happened while trying to get input types for this form");

    let inputs = result2.rows;

    const result3 = await pool.query(
      `
      select a.*, 
      b.* from author_input_property_values a
      inner join input_properties b
      on a.property_id = b.id
      inner join author_inputs c 
      on a.created_input_id = c.id
      where c.form_id = $1
    `,
      [form.id]
    );

    let properties = result3.rows;
    let propertiesObj: {
      [key: string]: any;
    } = {};

    properties.forEach((property) => {
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

    res.send({
      form,
      inputs,
      propertiesObj,
    });
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDraftForm = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      select * from draft_forms
      where id = $1
      and is_deleted = false
    `,
      [req.params.formId]
    );

    if (!result) throw new Error("There was an error getting this form");

    if (!result.rows[0]) {
      res.send([]);
    }

    const form = result.rows[0];

    const result2 = await pool.query(
      `
      select a.*, 
      b.name input_type_name,
      b.description input_type_description
      from draft_author_inputs a
      inner join input_types b
      on a.input_type_id = b.id
      where draft_form_id = $1
      and is_deleted = false
    `,
      [form.id]
    );

    if (!result2)
      throw new Error("Something happened while trying to get input types for this form");

    let inputs = result2.rows;

    const result3 = await pool.query(
      `
      select a.*, 
      b.* from draft_author_input_property_values a
      inner join input_properties b
      on a.property_id = b.id
      inner join draft_author_inputs c 
      on a.created_input_id = c.id
      where c.draft_form_id = $1
    `,
      [form.id]
    );

    let properties = result3.rows;
    let propertiesObj: {
      [key: string]: any;
    } = {};

    properties.forEach((property) => {
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

    res.send({
      form,
      inputs,
      propertiesObj,
    });
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDefaultInputTypes = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const result = await pool.query(`
      select * from input_types  
    `);

    if (!result) throw new Error("There was an error fetching form item data types");
    res.send(result.rows);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getPrivacyOptions = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const result = await pool.query(`
      select * from privacy_options  
    `);

    if (!result) throw new Error("There was an error fetching privacy options");
    res.send(result.rows);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDefaultInputProperties = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const result = await pool.query(`
      select * from input_properties 
    `);

    if (!result) throw new Error("There was an error fetching form item type properties");

    result.rows = result.rows.map((row: InputTypePropertyType) => ({
      ...row,
      ...(row.property_type !== "radio" && {
        value: "",
      }),
    }));

    const data = hashify(result.rows, "input_type_id");

    res.send(data);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getDefaultInputPropertyOptions = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const result = await pool.query(`
      select a.*,
      b.input_type_id input_type_id from input_property_options a
      inner join input_properties b
      on b.id = a.property_id
    `);

    if (!result) throw new Error("There was an error fetching form item type properties");

    result.rows = result.rows.map((row: InputTypePropertyOptionType) => ({
      ...row,
      checked: false,
    }));

    const data = hashify(result.rows, "property_id");

    res.send(data);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const checkForExistingDraft = async (
  req: Request<GenericQuery>,
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

    const result1 = await pool.query(
      `
        select * from draft_forms
        where created_by_id = $1
        and is_deleted = false
        and is_published = false
      `,
      [userId]
    );

    if (!result1) throw new Error("There was an error fetching existing form draft");

    draft.form = result1.rows[0];

    if (!draft.form) {
      res.send(draft);
      return;
    }

    const result2 = await pool.query(
      `
      select a.*, 
      b.name input_type_name, 
      b.description input_type_description,
      (
        select cast(count(*) as integer) from draft_author_input_property_values
        where created_input_id = a.id\
        and value is not null and value != ''
      ) num_custom_properties
      from draft_author_inputs a
      inner join input_types b
      on a.input_type_id = b.id
      where a.draft_form_id = $1
      order by a.id asc
    `,
      [draft.form.id]
    );

    if (!result2)
      throw new Error("There was an error fetching inputs for the existing form draft");

    draft.inputs = result2.rows;

    res.send(draft);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getExistingEmptyDraft = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      select * from draft_forms
      where created_by_id = $1
      and description = ''
      and title = 'Untitled'
      and modified_at is null
      and is_published = false
      and is_deleted = false
      order by created_at desc
      limit 1
    `,
      [req.user.id]
    );

    console.log(result.rows);

    if (!result) throw new Error("There was an error getting an existing empty draft");

    res.send(result.rows);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getPrevFormSubmissions = async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;

    if (!formId) throw new Error("Form ID not provided");

    const result = await pool.query(
      `
      select * from form_submissions
      where form_id = $1
      and created_by_id = $2
      order by created_at desc
    `,
      [formId, req.user.id]
    );

    if (!result)
      throw new Error("There was an error searching for previous form submission");

    res.send(result.rows);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const getInputSubmissions = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;

    if (!submissionId) throw new Error("No submission ID was provided in controller");

    const result2 = await pool.query(
      `
      select * from submitted_input_values
      where created_by_id = $1
      and submission_id = $2
      order by created_at desc
    `,
      [req.user.id, submissionId]
    );

    if (!result2)
      throw new Error("There was a problem fetching latest submitted input values");

    const latestInputSubmissions = {};

    result2.rows.forEach((inputSubmission) => {
      latestInputSubmissions[inputSubmission.created_input_id] = inputSubmission;
    });

    res.send(latestInputSubmissions);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const renewExistingEmptyDraft = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      update draft_forms
      set created_at = now()
      where id = $1
      returning *
    `,
      [req.body.draftFormId]
    );

    if (!result) throw new Error("There was an error renewing the existing draft");

    res.send(result.rows[0]);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const storeInitialDraft = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const result = await pool.query(
      `
        insert into draft_forms (
          title,
          description,
          passkey,
          is_published,
          created_by_id,
          created_at,
          modified_by_id,
          modified_at
        ) values (
          'Untitled',
          '',
          '',
          false,
          $1,
          now(),
          null,
          null
        )
        returning *
      `,
      [req.user.id]
    );

    if (!result) throw new Error("There was an error adding an initial form draft");

    result.rows[0];

    res.send(result.rows[0]);
  } catch (error) {
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
}

interface UpdateDraftRequest extends Request {
  body: UpdateDraftBody;
}

export const updateDraftForm = async (
  req: UpdateDraftRequest,
  res: Response
): Promise<object | void> => {
  try {
    const result2 = await pool.query(
      `
      update draft_forms
      set 
        title = $1,
        description = $2,
        passkey = $3,
        modified_by_id = $4,
        privacy_id = $5,
        modified_at = now()
      where id = $6
      returning *
    `,
      [
        req.body.title,
        req.body.description,
        req.body.privacyPasskey,
        req.user.id,
        req.body.privacyId,
        req.body.formId,
      ]
    );

    if (!result2) throw new Error("There was an error updating the form draft");

    if (!result2.rows[0]) throw new Error("form draft was not updated");

    res.send(result2.rows[0]);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const updatePublishedForm = async (
  req: UpdateDraftRequest,
  res: Response
): Promise<object | void> => {
  try {
    const result2 = await pool.query(
      `
      update forms
      set 
        title = $1,
        description = $2,
        passkey = $3,
        privacy_id = $4,
        modified_by_id = $5,
        modified_at = now()
      where id = $6
      returning *
    `,
      [
        req.body.title,
        req.body.description,
        req.body.privacyPasskey,
        req.body.privacyId,
        req.user.id,
        req.body.formId,
      ]
    );

    if (!result2) throw new Error("There was an error updating the published");

    if (!result2.rows[0]) throw new Error("published form was not updated");

    res.send(result2.rows[0]);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const addNewInputToDraftForm = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const result1 = await pool.query(
      `
      with inserted as (
        insert into draft_author_inputs
         (
          input_type_id,
          draft_form_id,
          metadata_question,
          metadata_description,
          is_active,
          created_at,
          created_by_id,
          modified_by_id,
          modified_at
        ) values (
          $1,
          $2,
          $3,
          $4,
          true,
          now(),
          $5,
          null,
          null
        ) returning * 
      )
      select a.*,
      b.name input_type_name
      from inserted a
      join input_types b
      on a.input_type_id = b.id
    `,
      [
        req.body.inputTypeId,
        req.body.formId,
        req.body.inputMetadataQuestion,
        req.body.inputMetadataDescription,
        req.user.id,
      ]
    );

    if (!result1) throw new Error("There was an error adding a user created input");

    const createdInput = result1.rows[0];

    let numCustomProperties = 0;

    if (req.body.properties) {
      req.body.properties.forEach(async (property, i: number) => {
        const result = await pool.query(
          `
          insert into draft_author_input_property_values
          (
            created_input_id, 
            property_id, 
            input_type_id, 
            value,
            created_at,
            created_by_id, 
            modified_by_id, 
            modified_at
          ) values (
            $1,
            $2,
            $3,
            $4,
            now(),
            $5,
            null,
            null
          ) 
        `,
          [
            createdInput.id,
            property.id,
            createdInput.input_type_id,
            property.value,
            req.user.id,
          ]
        );

        if (!result) throw new Error("There was an error adding this property value");

        if (property.value != null && property.value != "") numCustomProperties += 1;

        if (i == req.body.properties.length - 1) {
          res.send({ ...result1.rows[0], num_custom_properties: numCustomProperties });
          return;
        }
      });
    } else {
      res.send({ ...result1.rows[0], num_custom_properties: 0 });
    }
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const addNewInputToPublishedForm = async (
  req: Request,
  res: Response
): Promise<object | void> => {
  try {
    const result1 = await pool.query(
      `
      with inserted as (
        insert into author_inputs
        (
          input_type_id,
          form_id,
          metadata_question,
          metadata_description,
          is_active,
          published_at,
          published_by_id,
          created_at,
          created_by_id,
          modified_by_id,
          modified_at
        ) values (
          $1,
          $2,
          $3,
          $4,
          true,
          now(),
          $5,
          now(),
          $5,
          null,
          null
        ) returning * 
      )
      select a.*,
      b.name input_type_name
      from inserted a
      join input_types b
      on a.input_type_id = b.id
    `,
      [
        req.body.inputTypeId,
        req.body.formId,
        req.body.inputMetadataQuestion,
        req.body.inputMetadataDescription,
        req.user.id,
      ]
    );

    if (!result1) throw new Error("There was an error adding a user created input");

    const createdInput = result1.rows[0];

    let numCustomProperties = 0;

    if (req.body.properties) {
      req.body.properties.forEach(async (property, i: number) => {
        const result = await pool.query(
          `
          insert into author_input_property_values
          (
            created_input_id, 
            property_id, 
            input_type_id, 
            value,
            published_at,
            published_by_id,
            created_at,
            created_by_id, 
            modified_by_id, 
            modified_at
          ) values (
            $1,
            $2,
            $3,
            $4,
            now(),
            $5,
            now(),
            $5,
            null,
            null
          ) 
        `,
          [
            createdInput.id,
            property.id,
            createdInput.input_type_id,
            property.value,
            req.user.id,
          ]
        );

        if (!result) throw new Error("There was an error adding this property value");

        if (property.value != null && property.value != "") numCustomProperties += 1;

        if (i == req.body.properties.length - 1) {
          res.send({ ...result1.rows[0], num_custom_properties: numCustomProperties });
          return;
        }
      });
    } else {
      res.send({ ...result1.rows[0], num_custom_properties: 0 });
    }
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const changeInputEnabledStatus = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      update ${req.body.isDraft ? "draft_author_inputs" : "author_inputs"} 
      set is_active = $1
      where id = $2
      returning *
    `,
      [req.body.newActiveStatus, req.params.inputId]
    );

    if (!result) throw new Error("There was an error deleting this form item from draft");

    res.send(result.rows[0]);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const publishForm = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      select * from forms
      where draft_id = $1
    `,
      [req.body.draftFormId]
    );

    if (!result.rows[0] /* if not already in forms table */) {
      const result = await pool.query(
        `
        insert into forms (
          draft_id,
          title,
          description,
          passkey,
          privacy_id,
          is_deleted,
          published_by_id,
          published_at,
          created_by_id,
          created_at,
          modified_by_id,
          modified_at
        )
        select
          a.id,
          a.title,
          a.description,
          a.passkey,
          a.privacy_id,
          false,
          $2,
          now(),
          a.created_by_id,
          a.created_at,
          null,
          null
        from draft_forms a
        where a.id = $1
        returning *
      `,
        [req.body.draftFormId, req.user.id]
      );

      if (!result) throw new Error("Something went wrong when publishing the form");

      const newForm = result.rows[0];

      const result2 = await pool.query(
        `
        update draft_forms
        set is_published = true
        where id = $1
      `,
        [req.body.draftFormId]
      );

      if (!result2)
        throw new Error("There was an error updating the draft's is_published property.");

      const result3 = await pool.query(
        `
        insert into author_inputs (
          input_type_id,
          form_id,
          metadata_question ,
          metadata_description,
          is_active,
          is_deleted,
          published_at,
          published_by_id,
          created_at,
          created_by_id,
          modified_by_id,
          modified_at
        )
        select
          a.input_type_id,
          $1,
          a.metadata_question,
          a.metadata_description,
          a.is_active,
          a.is_deleted,
          now(),
          $2,
          a.created_at,
          a.created_by_id,
          a.modified_by_id,
          a.modified_at
        from draft_author_inputs a
        where a.draft_form_id = $3
        returning *
      `,
        [newForm.id, req.user.id, newForm.draft_id]
      );

      if (!result3)
        throw new Error("There was a problem moving over draft user created inputs");

      let insertedPropertyInputs = 0;

      let alreadySentToClient = false;

      result3.rows.forEach(async (input, i) => {
        const result4 = await pool.query(
          `
          insert into author_input_property_values (
            created_input_id,
            property_id,
            input_type_id,
            value,
            published_at,
            published_by_id,
            created_at,
            created_by_id,
            modified_by_id,
            modified_at
          )
          select
            $1,
            a.property_id,
            a.input_type_id,
            a.value,
            now(),
            $2,
            a.created_at,
            a.created_by_id,
            null,
            null
          from draft_author_input_property_values a
          inner join draft_author_inputs b
          on a.created_input_id = b.id
          inner join draft_forms c
          on b.draft_form_id = c.id
          where c.id = $3
        `,
          [input.id, req.user.id, newForm.draft_id]
        );

        insertedPropertyInputs += 1;

        if (insertedPropertyInputs === result3.rows.length) {
          alreadySentToClient = true;
          res.send(result.rows);
          return;
        }
      });

      if (insertedPropertyInputs === 0 && !result3.rows.length) {
        res.send(result.rows);
        return;
      } else {
      }
    } else {
      res.send(result.rows);
    }
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const deleteDraftForm = async (req: Request, res: Response) => {
  try {
    if (!req.params.formId) throw new Error("No form ID provided, cancelling deletion");

    const result = await pool.query(
      `
      update draft_forms
      set is_deleted = true
      where id = $1
      returning *
    `,
      [req.params.formId]
    );

    if (!result) throw new Error("There was an error deleting this draft form");

    res.send(result.rows);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const submitForm = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      insert into form_submissions (
        form_id,
        created_at,
        created_by_id
      ) values (
        $1,
        now(),
        $2 
      )
      returning *
    `,
      [req.body.formId, req.user.id]
    );

    if (!result) throw new Error("There was an error adding this form submission");

    const submittedForm = result.rows[0];

    if (!submittedForm) throw new Error("No submitted form was returned");

    // const submittedInputs = [];

    req.body.inputs.forEach(async (input) => {
      const result = await pool.query(
        `
        insert into submitted_input_values
        (
          submission_id,
          created_input_id, 
          value, 
          created_at, 
          created_by_id
        )
        values
        (
          $1,
          $2, 
          $3, 
          now(), 
          $4
        ) returning *;
      `,
        [submittedForm.id, input.id, input.value, req.user.id]
      );

      if (!result) throw new Error("There was an issue inserting the input values");

      // submittedInputs.push(result.rows[0]);
    });

    res.send(result.rows[0]);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};

export const deletePublishedForm = async (req: Request, res: Response) => {
  try {
    if (!req.params.formId) throw new Error("No form ID provided, cancelling deletion");

    const result = await pool.query(
      `
      update forms
      set is_deleted = true
      where id = $1
      returning *
    `,
      [req.params.formId]
    );

    if (!result) throw new Error("There was an error deleting this published form");

    res.send(result.rows);
  } catch (error) {
    let message = parseErrorMessage(error);

    return res.status(500).json({ message });
  }
};
