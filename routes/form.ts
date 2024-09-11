import * as express from "express";
import { pool } from "../config/database.js";
import {
  HashmapType,
  InputTypePropertyOptionType,
  InputTypePropertyType,
} from "../lib/types.js";
import { Request, Response } from "express";

const router = express.Router();

router.get("/get-form-as-user/:formId", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select * from forms
      where id = $1
    `,
      [req.params.formId]
    );

    if (!result) throw new Error("There was an error getting this form");

    console.log(result.rows);

    const result2 = await pool.query(`
      select * from draft_user_created_inputs
      where
    `);
  } catch (error) {
    console.log(error);
  }
});

router.get("/item-types", async (req, res): Promise<void> => {
  try {
    const result = await pool.query(`
      select * from input_types  
    `);

    if (!result) throw new Error("There was an error fetching form item data types");
    res.send(result.rows);
  } catch (error) {
    console.log(error);
  }
});

router.get("/item-type-properties", async (req, res): Promise<void> => {
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
});

router.get("/item-type-property-options", async (req, res): Promise<void> => {
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
});

interface GenericQuery {
  userId: string;
}

router.get(
  "/check-for-existing-draft",
  async (req: Request<GenericQuery>, res): Promise<void> => {
    try {
      const { userId } = req.query;

      const draft: {
        form: {
          id: number;
          name: string;
          description: string;
          passkey: string;
          eff_status: number;
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
          and eff_status = 1
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
        -- left join draft_user_created_input_property_values c
        -- on a.id = c.created_input_id
        where a.draft_form_id = $1
        --and a.eff_status = 1
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
  }
);

interface StoreInitialDraftBody {
  userId: number;
}

interface StoreInitialDraftRequest extends Request {
  body: StoreInitialDraftBody;
}

router.post(
  "/store-initial-draft",
  async (req: StoreInitialDraftRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        `
        insert into draft_forms (
          name,
          description,
          passkey,
          is_published,
          eff_status,
          created_by_id,
          created_at,
          modified_by_id,
          modified_at
        ) values (
          'Untitled',
          '',
          null,
          false,
          1,
          $1,
          now(),
          null,
          null
        )
        returning *
      `,
        [req.body.userId]
      );

      if (!result) throw new Error("There was an error adding an initial form draft");

      result.rows[0];

      res.send(result.rows[0]);
    } catch (error) {
      console.log(error);
    }
  }
);

interface UpdateDraftBody {
  draftFormId: string;
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
}

interface UpdateDraftRequest extends Request {
  body: UpdateDraftBody;
}

router.put(
  "/update-draft",
  async (req: UpdateDraftRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        `
        update draft_forms 
        set 
          name = $1,
          description = $2,
          passkey = $3,
          modified_by_id = $4,
          modified_at = now()
        where id = $5
        returning *
      `,
        [
          req.body.title,
          req.body.description,
          null,
          req.body.userId,
          req.body.draftFormId,
        ]
      );

      if (!result) throw new Error("There was an error updating the form draft");

      if (!result.rows[0]) throw new Error("New form draft was not updated");

      res.send(result.rows[0]);
    } catch (error) {
      console.log(error);
    }
  }
);

router.post("/add-new-input-to-draft", async (req, res) => {
  try {
    const result1 = await pool.query(
      `
      with inserted as (
        insert into draft_user_created_inputs (
          input_type_id,
          draft_form_id,
          metadata_name,
          metadata_description,
          is_active,
          eff_status,
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
          1,
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
        req.body.input.input_type_id,
        req.body.form.id,
        req.body.input.metadata_name,
        req.body.input.metadata_description,
        req.body.userId,
      ]
    );

    if (!result1) throw new Error("There was an error adding a user created input");

    const createdInput = result1.rows[0];

    let numCustomProperties = 0;

    if (req.body.input.properties) {
      req.body.input.properties.forEach(async (property, i) => {
        const result = await pool.query(
          `
          insert into draft_user_created_input_property_values (
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
            req.body.userId,
          ]
        );

        if (!result) throw new Error("There was an error adding this property value");

        console.log("property value: ", property.value);

        if (property.value != null && property.value != "") numCustomProperties += 1;

        if (i == req.body.input.properties.length - 1) {
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
});

router.put("/change-draft-input-enabled-status/:inputId", async (req, res) => {
  try {
    const result = await pool.query(
      `
      update draft_user_created_inputs
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
});

router.post("/publish", async (req, res) => {
  try {
    console.log("Publishing");

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
          name,
          description,
          passkey,
          eff_status,
          published_by_id,
          published_at,
          created_by_id,
          created_at,
          modified_by_id,
          modified_at
        )
        select
          a.id,
          a.name,
          a.description,
          a.passkey,
          1,
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
          metadata_name ,
          metadata_description,
          is_active,
          eff_status,
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
          a.metadata_name,
          a.metadata_description,
          a.is_active,
          a.eff_status,
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

      console.log(`Moved over ${result.rowCount} user created inputs`);

      let insertedPropertyValues = 0;

      result3.rows.forEach(async (input, i) => {
        console.log(input);
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
          where a.created_input_id = $1
        `,
          [input.id, req.body.userId]
        );

        insertedPropertyValues += 1;

        if (insertedPropertyValues === result3.rows.length - 1) {
          res.send(result.rows);
          return;
        }
      });

      if (insertedPropertyValues === 0 && !result2.rows.length) {
        res.send(result.rows);
        return;
      }
    }

    res.send(result.rows);
  } catch (error) {
    console.log(error);
  }
});

interface ObjectAny {
  [key: string]: any;
}

function hashify(rows: ObjectAny[], key: string) {
  {
    const hashmap: HashmapType = {};

    rows.forEach((row) => {
      let keySpecifier = "";
      if (key === "property_id") keySpecifier = `${row.input_type_id}-`;

      if (!hashmap[`${keySpecifier}${row[key as keyof object]}`])
        hashmap[`${keySpecifier}${row[key as keyof object]}`] = [row];
      else {
        hashmap[`${keySpecifier}${row[key as keyof object]}`] = [
          ...hashmap[`${keySpecifier}${row[key as keyof object]}`],
          row,
        ];
      }
    });

    return hashmap;
  }
}

export default router;