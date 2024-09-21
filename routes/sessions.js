"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var googleOAuthFuncs_1 = require("../utils/googleOAuthFuncs");
var findAndUpdateUser_1 = require("../utils/findAndUpdateUser");
var config_1 = require("../config/config");
var jwt = require("jsonwebtoken");
var router = express.Router();
router.get("/oauth/google", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var code, _a, id_token, access_token, googleUser, user, token, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                code = req.query.code;
                return [4 /*yield*/, (0, googleOAuthFuncs_1.getGoogleOAuthTokens)({ code: code })];
            case 1:
                _a = _b.sent(), id_token = _a.id_token, access_token = _a.access_token;
                return [4 /*yield*/, (0, googleOAuthFuncs_1.getGoogleUser)({
                        id_token: id_token,
                        access_token: access_token,
                    })];
            case 2:
                googleUser = _b.sent();
                if (!googleUser.verified_email) {
                    return [2 /*return*/, res.status(403).send("Google account is not verified")];
                }
                console.log("found google user", googleUser);
                return [4 /*yield*/, (0, findAndUpdateUser_1.findAndUpdateUser)(googleUser)];
            case 3:
                user = _b.sent();
                token = jwt.sign(user, process.env.SESSION_SECRET);
                res.cookie(config_1.config.jwtCookie, token, {
                    maxAge: 900000,
                    httpOnly: true,
                    secure: false
                });
                res.redirect('http://localhost:3000');
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                console.error(error_1);
                return [2 /*return*/, res.redirect("http://localhost:3000/error")];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
