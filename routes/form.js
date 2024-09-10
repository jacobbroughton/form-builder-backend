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
router.get("/item-types", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_1;
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
                error_1 = _a.sent();
                console.log(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/item-type-properties", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, data, error_2;
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
                error_2 = _a.sent();
                console.log(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/item-type-property-options", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, data, error_3;
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
                error_3 = _a.sent();
                console.log(error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/check-for-existing-draft", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, draft, result1, result2, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = req.query.userId;
                draft = {
                    form: null,
                    inputs: [],
                };
                return [4 /*yield*/, database_js_1.pool.query("\n          select * from draft_forms\n          where created_by_id = $1\n          and eff_status = 1\n        ", [userId])];
            case 1:
                result1 = _a.sent();
                if (!result1)
                    throw new Error("There was an error fetching existing form draft");
                console.log("Existing draft", result1.rows);
                draft.form = result1.rows[0];
                if (!draft.form) {
                    res.send(draft);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, database_js_1.pool.query("\n        select a.*, \n        b.name input_type_name, \n        b.description input_type_description,\n        (\n          select cast(count(*) as integer) from user_created_input_property_values\n          where created_input_id = a.id\n          and value is not null and value != ''\n        ) num_custom_properties\n        from user_created_inputs a\n        inner join input_types b\n        on a.input_type_id = b.id\n        -- left join user_created_input_property_values c\n        -- on a.id = c.created_input_id\n        where a.draft_form_id = $1\n        and a.eff_status = 1\n      ", [draft.form.id])];
            case 2:
                result2 = _a.sent();
                if (!result2)
                    throw new Error("There was an error fetching inputs for the existing form draft");
                draft.inputs = result2.rows;
                console.log(draft);
                res.send(draft);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.log(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/store-initial-draft", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log(req.body);
                return [4 /*yield*/, database_js_1.pool.query("\n        insert into draft_forms (\n          name,\n          description,\n          passkey,\n          eff_status,\n          created_by_id,\n          created_at,\n          modified_by_id,\n          modified_at\n        ) values (\n          'Untitled',\n          '',\n          null,\n          1,\n          $1,\n          now(),\n          null,\n          null\n        )\n        returning *\n      ", [req.body.userId])];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error adding an initial form draft");
                result.rows[0];
                res.send(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.log(error_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.put("/update-draft", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_js_1.pool.query("\n        update draft_forms \n        set \n          name = $1,\n          description = $2,\n          passkey = $3,\n          modified_by_id = $4,\n          modified_at = now()\n        returning *\n      ", [req.body.title, req.body.description, null, req.body.userId])];
            case 1:
                result = _a.sent();
                if (!result)
                    throw new Error("There was an error updating the form draft");
                if (!result.rows[0])
                    throw new Error("New form draft was not updated");
                res.send(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.log(error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post("/add-new-form-item-to-draft", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result1, createdInput_1, numCustomProperties_1, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log(req.body);
                return [4 /*yield*/, database_js_1.pool.query("\n      with inserted as (\n        insert into user_created_inputs (\n          input_type_id,\n          draft_form_id,\n          metadata_name,\n          metadata_description,\n          eff_status,\n          created_at,\n          created_by_id,\n          modified_by_id,\n          modified_at\n        ) values (\n          $1,\n          $2,\n          $3,\n          $4,\n          1,\n          now(),\n          $5,\n          null,\n          null\n        ) returning * \n      )\n      select a.*,\n      b.name input_type_name\n      from inserted a\n      join input_types b\n      on a.input_type_id = b.id\n    ", [
                        req.body.input.input_type_id,
                        req.body.form.id,
                        req.body.input.metadata_name,
                        req.body.input.metadata_description,
                        req.body.userId,
                    ])];
            case 1:
                result1 = _a.sent();
                if (!result1)
                    throw new Error("There was an error adding a user created input");
                createdInput_1 = result1.rows[0];
                numCustomProperties_1 = 0;
                if (req.body.input.properties) {
                    req.body.input.properties.forEach(function (property) { return __awaiter(void 0, void 0, void 0, function () {
                        var result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (property.value != null && property.value != "")
                                        numCustomProperties_1 += 1;
                                    return [4 /*yield*/, database_js_1.pool.query("\n          insert into user_created_input_property_values (\n            created_input_id, \n            property_id, \n            input_type_id, \n            value,\n            created_at,\n            created_by_id, \n            modified_by_id, \n            modified_at\n          ) values (\n            $1,\n            $2,\n            $3,\n            $4,\n            now(),\n            $5,\n            null,\n            null\n          ) \n        ", [
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
                                    console.log("Added property value");
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                console.log("Added user created input");
                res.send(__assign(__assign({}, result1.rows[0]), { num_custom_properties: numCustomProperties_1 }));
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.log(error_7);
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
