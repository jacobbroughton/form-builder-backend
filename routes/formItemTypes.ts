import * as express from "express";
import { pool } from "../config/database.js";

const router = express.Router();
console.log("Swag");

router.get("/", async (req, res): Promise<void> => {
  try {
    const result = await pool.query(`
      select * from form_item_data_types  
    `);

    if (!result) throw new Error("There was an error fetching form item data types")
    console.log(result.rows)
    res.send(result.rows)
  } catch (error) {
    console.log(error);
  }
});

export default router;
