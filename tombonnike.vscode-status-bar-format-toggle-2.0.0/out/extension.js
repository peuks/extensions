"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const registerCommand_1 = __importDefault(require("./registerCommand"));
const createStatusBarItem_1 = __importDefault(require("./createStatusBarItem"));
const getOnDidChangeConfigurationHandler_1 = __importDefault(require("./getOnDidChangeConfigurationHandler"));
function activate({ subscriptions }) {
    const command = registerCommand_1.default();
    const statusBarItem = createStatusBarItem_1.default();
    const onDidChangeConfigurationHandler = getOnDidChangeConfigurationHandler_1.default(statusBarItem);
    subscriptions.push(statusBarItem);
    subscriptions.push(command);
    subscriptions.push(onDidChangeConfigurationHandler);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map