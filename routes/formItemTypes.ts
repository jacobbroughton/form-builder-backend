import * as express from "express";
import { pool } from "../config/database.js";
import { HashmapType, FormItemTypePropertyOptionType, FormItemTypePropertyType } from "../lib/types.js";

const router = express.Router();

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

    result.rows = result.rows.map((row: FormItemTypePropertyType) => ({
      ...row,
      ...(row.property_type !== 'radio' && {
        value: ''
      })
    }))

    const data = hashify(result.rows, "input_type_id");

    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

router.get("/item-type-property-options", async (req, res): Promise<void> => {
  try {
    const result = await pool.query(`
      select * from input_property_options
    `);

    if (!result) throw new Error("There was an error fetching form item type properties");

    result.rows = result.rows.map((row: FormItemTypePropertyOptionType) => ({ ...row, checked: false}));

    const data = hashify(result.rows, "property_id");

    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

function hashify(rows: object[], key: string) {
  {
    const hashmap: HashmapType = {};

    rows.forEach((row) => {
      if (!hashmap[row[key as keyof object]]) hashmap[row[key as keyof object]] = [row];
      else {
        hashmap[row[key as keyof object]] = [...hashmap[row[key as keyof object]], row];
      }
    });

    return hashmap;
  }
}

export default router;
