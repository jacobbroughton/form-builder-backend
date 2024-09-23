import { Request, Response } from "express";
import { pool } from "../config/database.js";
import {
  GenericQuery,
  InputTypePropertyType,
  InputTypePropertyOptionType,
} from "../types/types.js";
import { hashify } from "../utils/hashify.js";

export const getAllForms = async (req: Request, res: Response) => {
  try {

    console.log("req.user", req.user)
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
         ? "combined.created_at asc"
         : req.params.sort === "date-old-new"
         ? "combined.created_at desc"
         : "combined.created_at asc"
     }
    `,
      [req.params.userId]
    );

    if (!result) throw new Error("There was an error fetching published forms");

    // const result2 = await pool.query(
    //   `
    //     select * from draft_forms
    //     where created_by_id = $1
    //     and is_published = false
    //     and is_deleted = false
    //     order by modified_at desc, created_at desc
    //   `,
    //   [req.params.userId]
    // );

    // if (!result2) throw new Error("There was an error fetching draft forms");

    // let forms = {
    //   drafts: result2.rows,
    //   published: result.rows,
    // };

    res.send(result.rows);
  } catch (error) {
    console.log(error);
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
    console.log(error);
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

    const result2 = await pool.query(
      `
      select a.*, 
      b.name input_type_name,
      b.description input_type_description
      from user_created_inputs a
      inner join input_types b
      on a.input_type_id = b.id
      where form_id = $1
      and is_deleted = false
      and is_active = true
    `,
      [form.id]
    );

    if (!result2)
      throw new Error("Something happened while trying to get input types for this form");

    let inputs = result2.rows;

    const result3 = await pool.query(
      `
      select a.*, 
      b.* from user_created_input_property_values a
      inner join input_properties b
      on a.property_id = b.id
      inner join user_created_inputs c 
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
    console.log(error);
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
      from draft_user_created_inputs a
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
      b.* from draft_user_created_input_property_values a
      inner join input_properties b
      on a.property_id = b.id
      inner join draft_user_created_inputs c 
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
    console.log(error);
  }
};

export const getDefaultInputTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(`
      select * from input_types  
    `);

    if (!result) throw new Error("There was an error fetching form item data types");
    res.send(result.rows);
  } catch (error) {
    console.log(error);
  }
};

export const getDefaultInputProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    console.log(error);
  }
};

export const getDefaultInputPropertyOptions = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    console.log(error);
  }
};

export const checkForExistingDraft = async (
  req: Request<GenericQuery>,
  res: Response
): Promise<void> => {
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
        select cast(count(*) as integer) from draft_user_created_input_property_values
        where created_input_id = a.id\
        and value is not null and value != ''
      ) num_custom_properties
      from draft_user_created_inputs a
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
    console.log(error);
  }
};

interface StoreInitialDraftBody {
  userId: number;
}

interface StoreInitialDraftRequest extends Request {
  body: StoreInitialDraftBody;
}

export const storeInitialDraft = async (
  req: StoreInitialDraftRequest,
  res: Response
): Promise<void> => {
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
    `,
      [req.body.userId]
    );

    if (!result.rows[0]) {
      const result2 = await pool.query(
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
          null,
          false,
          $1,
          now(),
          null,
          null
        )
        returning *
      `,
        [req.body.userId]
      );

      if (!result2) throw new Error("There was an error adding an initial form draft");

      result2.rows[0];

      res.send(result2.rows[0]);
    } else {
      const result2 = await pool.query(
        `
        update draft_forms
        set created_at = now()
        where id = $1
        returning *
      `,
        [result.rows[0].id]
      );

      res.send(result2.rows[0]);
    }
  } catch (error) {
    console.log(error);
  }
};

interface UpdateDraftBody {
  formId: string;
  title: string;
  description: string;
  userId: number;
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
  isForDraft: boolean;
}

interface UpdateDraftRequest extends Request {
  body: UpdateDraftBody;
}

export const updateForm = async (
  req: UpdateDraftRequest,
  res: Response
): Promise<void> => {
  try {
    const result2 = await pool.query(
      `
      update ${req.body.isForDraft ? "draft_forms" : "forms"}
      set 
        title = $1,
        description = $2,
        passkey = $3,
        modified_by_id = $4,
        modified_at = now()
      where id = $5
      returning *
    `,
      [req.body.title, req.body.description, null, req.body.userId, req.body.formId]
    );

    if (!result2) throw new Error("There was an error updating the form draft");

    if (!result2.rows[0]) throw new Error("form draft was not updated");

    res.send(result2.rows[0]);
  } catch (error) {
    console.log(error);
  }
};

export const addNewInputToForm = async (req: Request, res: Response) => {
  try {
    const result1 = await pool.query(
      `
      with inserted as (
        insert into ${
          req.body.isForDraft ? "draft_user_created_inputs" : "user_created_inputs"
        } (
          input_type_id,
          ${req.body.isForDraft ? "draft_form_id" : "form_id"},
          metadata_question,
          metadata_description,
          is_active,
          ${req.body.isForDraft ? "" : "published_at,"}
          ${req.body.isForDraft ? "" : "published_by_id,"}
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
          ${req.body.isForDraft ? "" : "now(),"}
          ${req.body.isForDraft ? "" : "$5,"}
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
        req.body.userId,
      ]
    );

    if (!result1) throw new Error("There was an error adding a user created input");

    const createdInput = result1.rows[0];

    let numCustomProperties = 0;

    if (req.body.properties) {
      req.body.properties.forEach(async (property, i: number) => {
        const result = await pool.query(
          `
          insert into ${
            req.body.isForDraft
              ? "draft_user_created_input_property_values"
              : "user_created_input_property_values"
          } (
            created_input_id, 
            property_id, 
            input_type_id, 
            value,
            ${req.body.isForDraft ? "" : "published_at,"}
            ${req.body.isForDraft ? "" : "published_by_id,"}
            created_at,
            created_by_id, 
            modified_by_id, 
            modified_at
          ) values (
            $1,
            $2,
            $3,
            $4,
            ${req.body.isForDraft ? "" : "now(),"}
            ${req.body.isForDraft ? "" : "$5,"}
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
            req.body.userId,
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
    console.log(error);
  }
};

export const changeInputEnabledStatus = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      update ${req.body.isDraft ? "draft_user_created_inputs" : "user_created_inputs"} 
      set is_active = $1
      where id = $2
      returning *
    `,
      [req.body.newActiveStatus, req.params.inputId]
    );

    if (!result) throw new Error("There was an error deleting this form item from draft");

    res.send(result.rows[0]);
  } catch (error) {
    console.log(error);
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
        [req.body.draftFormId, req.body.userId]
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
        insert into user_created_inputs (
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
        from draft_user_created_inputs a
        where a.draft_form_id = $3
        returning *
      `,
        [newForm.id, req.body.userId, newForm.draft_id]
      );

      if (!result3)
        throw new Error("There was a problem moving over draft user created inputs");

      let insertedPropertyInputs = 0;

      let alreadySentToClient = false;

      result3.rows.forEach(async (input, i) => {
        const result4 = await pool.query(
          `
          insert into user_created_input_property_values (
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
          from draft_user_created_input_property_values a
          inner join draft_user_created_inputs b
          on a.created_input_id = b.id
          inner join draft_forms c
          on b.draft_form_id = c.id
          where c.id = $3
        `,
          [input.id, req.body.userId, newForm.draft_id]
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
  }
};