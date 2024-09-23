import { HashmapType } from "../types/types.js";

interface ObjectAny {
  [key: string]: any;
}

export function hashify(rows: ObjectAny[], key: string) {
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
