"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const commandManager_1 = require("./commandManager");
const commands = require("./commands/index");
const previewContentProvider_1 = require("./features/previewContentProvider");
const previewManager_1 = require("./features/previewManager");
const logger_1 = require("./logger");
const security_1 = require("./security");
const python_1 = require("./python");
const rstEngine_1 = require("./rstEngine");
const rstLinter_1 = require("./features/rstLinter");
const underline_1 = require("./features/underline");
const configuration_1 = require("./features/utils/configuration");
const statusBar_1 = require("./features/utils/statusBar");
const RstLanguageServer = require("./rstLsp/extension");
const rstDocumentSymbolProvider_1 = require("./features/rstDocumentSymbolProvider");
let extensionPath = "";
function getExtensionPath() {
    return extensionPath;
}
exports.getExtensionPath = getExtensionPath;
async function activate(context) {
    extensionPath = context.extensionPath;
    const logger = new logger_1.Logger();
    logger.log('Please visit https://docs.restructuredtext.net to learn how to configure the extension.');
    const conflicting = configuration_1.Configuration.getConflictingExtensions();
    for (const element of conflicting) {
        const found = vscode.extensions.getExtension(element);
        if (found) {
            const message = `Found conflicting extension ${element}. Please uninstall it.`;
            logger.log(message);
            logger.telemetry(message);
            vscode.window.showErrorMessage(message);
        }
    }
    await logPlatform(logger);
    const disableLsp = configuration_1.Configuration.getLanguageServerDisabled();
    const python = new python_1.Python(logger);
    // activate language services
    const rstLspPromise = RstLanguageServer.activate(context, logger, disableLsp, python);
    // Section creation support.
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('restructuredtext.features.underline.underline', underline_1.underline), vscode.commands.registerTextEditorCommand('restructuredtext.features.underline.underlineReverse', (textEditor, edit) => underline_1.underline(textEditor, edit, true)));
    // Linter support
    if (!configuration_1.Configuration.getLinterDisabled()) {
        const linter = new rstLinter_1.default(logger, python);
        linter.activate(context.subscriptions);
    }
    if (!configuration_1.Configuration.getDocUtilDisabled() || !configuration_1.Configuration.getSphinxDisabled()) {
        // Status bar to show the active rst->html transformer configuration
        const status = new statusBar_1.default(python, logger);
        // Hook up the status bar to document change events
        context.subscriptions.push(vscode.commands.registerCommand('restructuredtext.resetStatus', status.reset, status));
        vscode.window.onDidChangeActiveTextEditor(status.update, status, context.subscriptions);
        status.update();
        const cspArbiter = new security_1.ExtensionContentSecurityPolicyArbiter(context.globalState, context.workspaceState);
        const engine = new rstEngine_1.RSTEngine(python, logger, status);
        const contentProvider = new previewContentProvider_1.RSTContentProvider(context, cspArbiter, engine, logger);
        const previewManager = new previewManager_1.RSTPreviewManager(contentProvider, logger);
        context.subscriptions.push(previewManager);
        const previewSecuritySelector = new security_1.PreviewSecuritySelector(cspArbiter, previewManager);
        const commandManager = new commandManager_1.CommandManager();
        context.subscriptions.push(commandManager);
        commandManager.register(new commands.ShowPreviewCommand(previewManager, python));
        commandManager.register(new commands.ShowPreviewToSideCommand(previewManager, python));
        commandManager.register(new commands.ShowLockedPreviewToSideCommand(previewManager, python));
        commandManager.register(new commands.ShowSourceCommand(previewManager));
        commandManager.register(new commands.RefreshPreviewCommand(previewManager));
        commandManager.register(new commands.MoveCursorToPositionCommand());
        commandManager.register(new commands.ShowPreviewSecuritySelectorCommand(previewSecuritySelector, previewManager));
        commandManager.register(new commands.OpenDocumentLinkCommand());
        commandManager.register(new commands.ToggleLockCommand(previewManager));
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
            logger.updateConfiguration();
            previewManager.updateConfiguration();
        }));
    }
    // DocumentSymbolProvider Demo, for Outline View Test
    let disposableRstDSP = vscode.languages.registerDocumentSymbolProvider({ scheme: 'file', language: 'restructuredtext' }, new rstDocumentSymbolProvider_1.rstDocumentSymbolProvider());
    context.subscriptions.push(disposableRstDSP);
    return {
        initializationFinished: Promise.all([rstLspPromise])
            .then((promiseResult) => {
            // This promise resolver simply swallows the result of Promise.all.
            // When we decide we want to expose this level of detail
            // to other extensions then we will design that return type and implement it here.
        }),
    };
}
exports.activate = activate;
async function logPlatform(logger) {
    const os = require('os');
    let platform = os.platform();
    logger.log(`OS is ${platform}`);
    if (platform === 'darwin' || platform === 'win32') {
        return;
    }
    const osInfo = require('linux-os-info');
    const result = await osInfo();
    const dist = result.id;
    logger.log(`dist: ${dist}`);
}
//# sourceMappingURL=extension.js.map