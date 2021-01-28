"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
const getStatusBarText_1 = __importDefault(require("./helpers/getStatusBarText"));
// Taken from the `prettier-vscode` repo.
const PRETTIER_STATUS_BAR_PRIORITY = -1;
const TOOLTIP_TEXT = 'Enable/Disable the formatter';
const createStatusBarItem = () => {
    const statusBar = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 
    // We substract one so that it is always to the right of the Prettier status
    // bar item. If we didn’t do this, the position could switch randomly.
    PRETTIER_STATUS_BAR_PRIORITY - 1);
    statusBar.command = constants_1.COMMAND_NAME;
    statusBar.tooltip = TOOLTIP_TEXT;
    statusBar.text = getStatusBarText_1.default();
    statusBar.show();
    return statusBar;
};
exports.default = createStatusBarItem;
//# sourceMappingURL=createStatusBarItem.js.map