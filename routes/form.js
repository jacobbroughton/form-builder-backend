"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var database_js_1 = require("../config/database.js");
var router = express.Router();
router.get("/get-forms/:userId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, result2, forms, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, database_js_1.pool.query("\n      select * from forms\n      where created_by_id = $1\n      order by modified_at, created_at desc\n    ", [req.params.userId])];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error fetching published forms");
                return [4 /*yield*/, database_js_1.pool.query("\n        select * from draft_forms\n        where created_by_id = $1\n        and is_published = false\n        order by modified_at, created_at desc\n      ", [req.params.userId])];
            case 2:
                result2 = _a.sent();
                if (!result2)
                    throw new Error("There was an error fetching draft forms");
                forms = {
                    drafts: result2.rows,
                    published: result.rows,
                };
                res.send(forms);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.log(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get("/get-draft-forms/:userId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_js_1.pool.query("\n        select * from draft_forms\n        where created_by_id = $1\n        and is_published = false\n        order by modified_at, created_at desc\n      ", [req.params.userId])];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error fetching draft forms");
                res.send(result.rows);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.log(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/get-published-form-as-user/:formId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, form, result2, inputs, result3, properties, propertiesObj_1, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, database_js_1.pool.query("\n      select * from forms\n      where id = $1\n    ", [req.params.formId])];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error getting this form");
                if (!result.rows[0])
                    throw new Error("No form was found");
                form = result.rows[0];
                return [4 /*yield*/, database_js_1.pool.query("\n      select a.*, \n      b.name input_type_name,\n      b.description input_type_description\n      from user_created_inputs a\n      inner join input_types b\n      on a.input_type_id = b.id\n      where form_id = $1\n      and is_deleted = true\n    ", [form.id])];
            case 2:
                result2 = _a.sent();
                if (!result2)
                    throw new Error("Something happened while trying to get input types for this form");
                inputs = result2.rows;
                return [4 /*yield*/, database_js_1.pool.query("\n      select a.*, \n      b.* from user_created_input_property_values a\n      inner join input_properties b\n      on a.property_id = b.id\n      inner join user_created_inputs c \n      on a.created_input_id = c.id\n      where c.form_id = $1\n    ", [form.id])];
            case 3:
                result3 = _a.sent();
                properties = result3.rows;
                propertiesObj_1 = {};
                properties.forEach(function (property) {
                    if (!propertiesObj_1["".concat(property.created_input_id)])
                        propertiesObj_1["".concat(property.created_input_id)] = {};
                    propertiesObj_1["".concat(property.created_input_id)][property.property_key] = property;
                });
                inputs = inputs.map(function (input) {
                    return __assign(__assign({}, input), { properties: propertiesObj_1[input.id] });
                });
                res.send({
                    form: form,
                    inputs: inputs,
                    propertiesObj: propertiesObj_1,
                });
                return [3 /*break*/, 5];
            case 4:
                error_3 = _a.sent();
                console.log(error_3);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.get("/get-draft-form/:formId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, form, result2, inputs, result3, properties, propertiesObj_2, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, database_js_1.pool.query("\n      select * from draft_forms\n      where id = $1\n    ", [req.params.formId])];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error getting this form");
                if (!result.rows[0])
                    throw new Error("No form was found");
                form = result.rows[0];
                return [4 /*yield*/, database_js_1.pool.query("\n      select a.*, \n      b.name input_type_name,\n      b.description input_type_description\n      from draft_user_created_inputs a\n      inner join input_types b\n      on a.input_type_id = b.id\n      where draft_form_id = $1\n      and is_deleted = true\n    ", [form.id])];
            case 2:
                result2 = _a.sent();
                if (!result2)
                    throw new Error("Something happened while trying to get input types for this form");
                inputs = result2.rows;
                return [4 /*yield*/, database_js_1.pool.query("\n      select a.*, \n      b.* from draft_user_created_input_property_values a\n      inner join input_properties b\n      on a.property_id = b.id\n      inner join draft_user_created_inputs c \n      on a.created_input_id = c.id\n      where c.draft_form_id = $1\n    ", [form.id])];
            case 3:
                result3 = _a.sent();
                properties = result3.rows;
                propertiesObj_2 = {};
                properties.forEach(function (property) {
                    if (!propertiesObj_2["".concat(property.created_input_id)])
                        propertiesObj_2["".concat(property.created_input_id)] = {};
                    propertiesObj_2["".concat(property.created_input_id)][property.property_key] = property;
                });
                inputs = inputs.map(function (input) {
                    return __assign(__assign({}, input), { properties: propertiesObj_2[input.id] });
                });
                res.send({
                    form: form,
                    inputs: inputs,
                    propertiesObj: propertiesObj_2,
                });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                console.log(error_4);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.get("/item-types", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_js_1.pool.query("\n      select * from input_types  \n    ")];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error fetching form item data types");
                res.send(result.rows);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.log(error_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/item-type-properties", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, data, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_js_1.pool.query("\n      select * from input_properties \n    ")];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error fetching form item type properties");
                result.rows = result.rows.map(function (row) { return (__assign(__assign({}, row), (row.property_type !== "radio" && {
                    value: "",
                }))); });
                data = hashify(result.rows, "input_type_id");
                res.send(data);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.log(error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/item-type-property-options", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, data, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_js_1.pool.query("\n      select a.*,\n      b.input_type_id input_type_id from input_property_options a\n      inner join input_properties b\n      on b.id = a.property_id\n    ")];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error fetching form item type properties");
                result.rows = result.rows.map(function (row) { return (__assign(__assign({}, row), { checked: false })); });
                data = hashify(result.rows, "property_id");
                res.send(data);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.log(error_7);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/check-for-existing-draft", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, draft, result1, result2, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = req.query.userId;
                draft = {
                    form: null,
                    inputs: [],
                };
                return [4 /*yield*/, database_js_1.pool.query("\n          select * from draft_forms\n          where created_by_id = $1\n          and is_deleted = true\n          and is_published = false\n        ", [userId])];
            case 1:
                result1 = _a.sent();
                if (!result1)
                    throw new Error("There was an error fetching existing form draft");
                draft.form = result1.rows[0];
                if (!draft.form) {
                    res.send(draft);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, database_js_1.pool.query("\n        select a.*, \n        b.name input_type_name, \n        b.description input_type_description,\n        (\n          select cast(count(*) as integer) from draft_user_created_input_property_values\n          where created_input_id = a.id          and value is not null and value != ''\n        ) num_custom_properties\n        from draft_user_created_inputs a\n        inner join input_types b\n        on a.input_type_id = b.id\n        where a.draft_form_id = $1\n        order by a.id asc\n      ", [draft.form.id])];
            case 2:
                result2 = _a.sent();
                if (!result2)
                    throw new Error("There was an error fetching inputs for the existing form draft");
                draft.inputs = result2.rows;
                res.send(draft);
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                console.log(error_8);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/store-initial-draft", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_js_1.pool.query("\n        insert into draft_forms (\n          title,\n          description,\n          passkey,\n          is_published,\n          created_by_id,\n          created_at,\n          modified_by_id,\n          modified_at\n        ) values (\n          'Untitled',\n          '',\n          null,\n          false,\n          $1,\n          now(),\n          null,\n          null\n        )\n        returning *\n      ", [req.body.userId])];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error adding an initial form draft");
                result.rows[0];
                res.send(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.log(error_9);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.put("/update-draft", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result2, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_js_1.pool.query("\n        update draft_forms \n        set \n          title = $1,\n          description = $2,\n          passkey = $3,\n          modified_by_id = $4,\n          modified_at = now()\n        where id = $5\n        returning *\n      ", [
                        req.body.title,
                        req.body.description,
                        null,
                        req.body.userId,
                        req.body.draftFormId,
                    ])];
            case 1:
                result2 = _a.sent();
                if (!result2)
                    throw new Error("There was an error updating the form draft");
                if (!result2.rows[0])
                    throw new Error("New form draft was not updated");
                res.send(result2.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_10 = _a.sent();
                console.log(error_10);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post("/add-new-input-to-draft", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result1_1, createdInput_1, numCustomProperties_1, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_js_1.pool.query("\n      with inserted as (\n        insert into draft_user_created_inputs (\n          input_type_id,\n          draft_form_id,\n          metadata_question,\n          metadata_description,\n          is_active,\n          created_at,\n          created_by_id,\n          modified_by_id,\n          modified_at\n        ) values (\n          $1,\n          $2,\n          $3,\n          $4,\n          true,\n          now(),\n          $5,\n          null,\n          null\n        ) returning * \n      )\n      select a.*,\n      b.name input_type_name\n      from inserted a\n      join input_types b\n      on a.input_type_id = b.id\n    ", [
                        req.body.input.input_type_id,
                        req.body.form.id,
                        req.body.input.metadata_question,
                        req.body.input.metadata_description,
                        req.body.userId,
                    ])];
            case 1:
                result1_1 = _a.sent();
                if (!result1_1)
                    throw new Error("There was an error adding a user created input");
                createdInput_1 = result1_1.rows[0];
                numCustomProperties_1 = 0;
                if (req.body.input.properties) {
                    req.body.input.properties.forEach(function (property, i) { return __awaiter(void 0, void 0, void 0, function () {
                        var result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, database_js_1.pool.query("\n          insert into draft_user_created_input_property_values (\n            created_input_id, \n            property_id, \n            input_type_id, \n            value,\n            created_at,\n            created_by_id, \n            modified_by_id, \n            modified_at\n          ) values (\n            $1,\n            $2,\n            $3,\n            $4,\n            now(),\n            $5,\n            null,\n            null\n          ) \n        ", [
                                        createdInput_1.id,
                                        property.id,
                                        createdInput_1.input_type_id,
                                        property.value,
                                        req.body.userId,
                                    ])];
                                case 1:
                                    result = _a.sent();
                                    if (!result)
                                        throw new Error("There was an error adding this property value");
                                    console.log("property value: ", property.value);
                                    if (property.value != null && property.value != "")
                                        numCustomProperties_1 += 1;
                                    if (i == req.body.input.properties.length - 1) {
                                        res.send(__assign(__assign({}, result1_1.rows[0]), { num_custom_properties: numCustomProperties_1 }));
                                        return [2 /*return*/];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                else {
                    res.send(__assign(__assign({}, result1_1.rows[0]), { num_custom_properties: 0 }));
                }
                return [3 /*break*/, 3];
            case 2:
                error_11 = _a.sent();
                console.log(error_11);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.put("/change-draft-input-enabled-status/:inputId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_js_1.pool.query("\n      update draft_user_created_inputs\n      set is_active = $1\n      where id = $2\n      returning *\n    ", [req.body.newActiveStatus, req.params.inputId])];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error deleting this form item from draft");
                res.send(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_12 = _a.sent();
                console.log(error_12);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post("/publish", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, result_1, newForm_1, result2, result3_1, insertedPropertyInputs_1, alreadySentToClient_1, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                console.log("Publishing");
                return [4 /*yield*/, database_js_1.pool.query("\n      select * from forms\n      where draft_id = $1\n    ", [req.body.draftFormId])];
            case 1:
                result = _a.sent();
                if (!!result.rows[0] /* if not already in forms table */) return [3 /*break*/, 5]; /* if not already in forms table */
                return [4 /*yield*/, database_js_1.pool.query("\n        insert into forms (\n          draft_id,\n          title,\n          description,\n          passkey,\n          is_deleted,\n          published_by_id,\n          published_at,\n          created_by_id,\n          created_at,\n          modified_by_id,\n          modified_at\n        )\n        select\n          a.id,\n          a.title,\n          a.description,\n          a.passkey,\n          1,\n          $2,\n          now(),\n          a.created_by_id,\n          a.created_at,\n          null,\n          null\n        from draft_forms a\n        where a.id = $1\n        returning *\n      ", [req.body.draftFormId, req.body.userId])];
            case 2:
                result_1 = _a.sent();
                if (!result_1)
                    throw new Error("Something went wrong when publishing the form");
                newForm_1 = result_1.rows[0];
                return [4 /*yield*/, database_js_1.pool.query("\n        update draft_forms\n        set is_published = true\n        where id = $1\n      ", [req.body.draftFormId])];
            case 3:
                result2 = _a.sent();
                if (!result2)
                    throw new Error("There was an error updating the draft's is_published property.");
                return [4 /*yield*/, database_js_1.pool.query("\n        insert into user_created_inputs (\n          input_type_id,\n          form_id,\n          metadata_question ,\n          metadata_description,\n          is_active,\n          is_deleted,\n          published_at,\n          published_by_id,\n          created_at,\n          created_by_id,\n          modified_by_id,\n          modified_at\n        )\n        select\n          a.input_type_id,\n          $1,\n          a.metadata_question,\n          a.metadata_description,\n          a.is_active,\n          a.is_deleted,\n          now(),\n          $2,\n          a.created_at,\n          a.created_by_id,\n          a.modified_by_id,\n          a.modified_at\n        from draft_user_created_inputs a\n        where a.draft_form_id = $3\n        returning *\n      ", [newForm_1.id, req.body.userId, newForm_1.draft_id])];
            case 4:
                result3_1 = _a.sent();
                if (!result3_1)
                    throw new Error("There was a problem moving over draft user created inputs");
                console.log("Moved over ".concat(result_1.rowCount, " user created inputs"));
                insertedPropertyInputs_1 = 0;
                alreadySentToClient_1 = false;
                result3_1.rows.forEach(function (input, i) { return __awaiter(void 0, void 0, void 0, function () {
                    var result4;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log("swiggity", input.id, req.body.userId, newForm_1.draft_id);
                                return [4 /*yield*/, database_js_1.pool.query("\n          insert into user_created_input_property_values (\n            created_input_id,\n            property_id,\n            input_type_id,\n            value,\n            published_at,\n            published_by_id,\n            created_at,\n            created_by_id,\n            modified_by_id,\n            modified_at\n          )\n          select\n            $1,\n            a.property_id,\n            a.input_type_id,\n            a.value,\n            now(),\n            $2,\n            a.created_at,\n            a.created_by_id,\n            null,\n            null\n          from draft_user_created_input_property_values a\n          inner join draft_user_created_inputs b\n          on a.created_input_id = b.id\n          inner join draft_forms c\n          on b.draft_form_id = c.id\n          where c.id = $3\n        ", [input.id, req.body.userId, newForm_1.draft_id])];
                            case 1:
                                result4 = _a.sent();
                                insertedPropertyInputs_1 += 1;
                                if (insertedPropertyInputs_1 === result3_1.rows.length) {
                                    console.log("Sending to client");
                                    alreadySentToClient_1 = true;
                                    res.send(result_1.rows);
                                    return [2 /*return*/];
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                if (insertedPropertyInputs_1 === 0 && !result3_1.rows.length) {
                    console.log("Also sending here", insertedPropertyInputs_1, result3_1.rows.length);
                    res.send(result_1.rows);
                    return [2 /*return*/];
                }
                else {
                    console.log("Swag???", insertedPropertyInputs_1, result3_1.rows.length);
                }
                return [3 /*break*/, 6];
            case 5:
                console.log("indeed sending here as well");
                res.send(result.rows);
                _a.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                error_13 = _a.sent();
                console.log(error_13);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
router.put("/delete-draft-form/:formId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.params.formId)
                    throw new Error("No form ID provided, cancelling deletion");
                return [4 /*yield*/, database_js_1.pool.query("\n      update draft_forms\n      set is_deleted = true\n      where id = $1\n      returning *\n    ", [req.params.formId])];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error deleting this draft form");
                console.log("Deleted form. ID:", req.params.formId);
                res.send(result.rows);
                return [3 /*break*/, 3];
            case 2:
                error_14 = _a.sent();
                console.log(error_14);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.put("/delete-published-form/:formId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.params.formId)
                    throw new Error("No form ID provided, cancelling deletion");
                return [4 /*yield*/, database_js_1.pool.query("\n      update forms\n      set is_deleted = true\n      where id = $1\n      returning *\n    ", [req.params.formId])];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error deleting this published form");
                console.log("Deleted form. ID:", req.params.formId);
                res.send(result.rows);
                return [3 /*break*/, 3];
            case 2:
                error_15 = _a.sent();
                console.log(error_15);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
function hashify(rows, key) {
    {
        var hashmap_1 = {};
        rows.forEach(function (row) {
            var keySpecifier = "";
            if (key === "property_id")
                keySpecifier = "".concat(row.input_type_id, "-");
            if (!hashmap_1["".concat(keySpecifier).concat(row[key])])
                hashmap_1["".concat(keySpecifier).concat(row[key])] = [row];
            else {
                hashmap_1["".concat(keySpecifier).concat(row[key])] = __spreadArray(__spreadArray([], hashmap_1["".concat(keySpecifier).concat(row[key])], true), [
                    row,
                ], false);
            }
        });
        return hashmap_1;
    }
}
exports.default = router;
