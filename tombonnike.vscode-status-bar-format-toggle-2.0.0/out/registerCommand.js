"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
const getConfiguration_1 = __importDefault(require("./helpers/getConfiguration"));
const getIsFormattingActivated_1 = __importDefault(require("./helpers/getIsFormattingActivated"));
const registerCommand = () => vscode_1.commands.registerCommand(constants_1.COMMAND_NAME, () => {
    const editorConfiguration = getConfiguration_1.default('editor');
    const formattingToggleConfiguration = getConfiguration_1.default('formattingToggle');
    const affectsConfiguration = formattingToggleConfiguration.get('affects', constants_1.DEFAULT_AFFECTS_CONFIGURATION);
    const isFormattingActivated = getIsFormattingActivated_1.default();
    // Updating the configuration will trigger the `onDidChangeConfiguration`
    // handler which will correctly update the text and icon in the status bar.
    constants_1.FORMATTING_SETTINGS.forEach(setting => {
        if (affectsConfiguration.includes(setting)) {
            editorConfiguration.update(setting, !isFormattingActivated, vscode_1.ConfigurationTarget.Global);
        }
    });
});
exports.default = registerCommand;
//# sourceMappingURL=registerCommand.js.map