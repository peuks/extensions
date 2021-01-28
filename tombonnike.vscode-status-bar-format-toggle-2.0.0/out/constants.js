"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This should be kept in sync with the command name specified in the
// `package.json` file: `contributes.commands[0].command`.
exports.COMMAND_NAME = 'formattingToggle.toggleFormat';
exports.FORMATTING_SETTINGS = [
    'formatOnPaste',
    'formatOnSave',
    'formatOnType'
];
// This should be kept in sync with the default specified in the `package.json`
// file: `contributes.configuration.properties.formattingToggle.affects.default`.
// By default, we want to always toggle all formatting settings.
exports.DEFAULT_AFFECTS_CONFIGURATION = [...exports.FORMATTING_SETTINGS];
//# sourceMappingURL=constants.js.map