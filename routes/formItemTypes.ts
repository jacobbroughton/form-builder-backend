import * as express from "express";
import { pool } from "../config/database.js";

const router = express.Router();

router.get("/item-types", async (req, res): Promise<void> => {
  try {
    const result = await pool.query(`
      select * from form_item_data_types  
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
      select * from form_item_properties 
    `);

    if (!result) throw new Error("There was an error fetching form item type properties");

    let hashmap = {};

    result.rows.forEach((row) => {
      if (!hashmap[row.data_type_id]) hashmap[row.data_type_id] = row;
      else {
        hashmap[row.data_type_id] = [...hashmap[row.data_type_id], row]
      }
    });
    res.send(hashmap);
  } catch (error) {
    console.log(error);
  }
});

export default router;
