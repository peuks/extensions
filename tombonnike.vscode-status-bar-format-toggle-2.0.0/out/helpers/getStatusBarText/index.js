"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getIsFormattingActivated_1 = __importDefault(require("../getIsFormattingActivated"));
exports.ENABLED_TEXT = 'Formatting: $(check)';
exports.DISABLED_TEXT = 'Formatting: $(x)';
const getStatusBarText = () => {
    const isFormattingActivated = getIsFormattingActivated_1.default();
    return isFormattingActivated ? exports.ENABLED_TEXT : exports.DISABLED_TEXT;
};
exports.default = getStatusBarText;
//# sourceMappingURL=index.js.map