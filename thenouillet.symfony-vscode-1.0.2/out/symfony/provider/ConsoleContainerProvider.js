"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const jsonStripComments = require("strip-json-comments");
const ServiceDefinition_1 = require("../ServiceDefinition");
const child_process_1 = require("child_process");
const ComposerJSON_1 = require("../ComposerJSON");
const RouteDefinition_1 = require("../RouteDefinition");
const Parameter_1 = require("../Parameter");
class ConsoleContainerProvider {
    constructor() {
        this._configuration = vscode.workspace.getConfiguration("symfony-vscode");
        this._composerJson = new ComposerJSON_1.ComposerJSON();
    }
    canProvideServiceDefinitions() {
        return true;
    }
    canProvideRouteDefinitions() {
        return true;
    }
    canProvideParameters() {
        return true;
    }
    provideServiceDefinitions() {
        return this._executeCommand(["debug:container", "--show-private"], (obj) => {
            let result = [];
            let collection = {};
            if (obj.definitions !== undefined) {
                Object.keys(obj.definitions).forEach(key => {
                    collection[key] = (new ServiceDefinition_1.ServiceDefinition(key, obj.definitions[key].class, obj.definitions[key].public, null));
                });
            }
            if (obj.aliases !== undefined) {
                Object.keys(obj.aliases).forEach(key => {
                    let alias = obj.aliases[key].service;
                    let className = collection[alias] ? collection[alias].className : null;
                    collection[key] = (new ServiceDefinition_1.ServiceDefinition(key, className, obj.aliases[key].public, alias));
                });
            }
            Object.keys(collection).forEach(key => {
                if (!this._matchServicesFilters(collection[key].id, collection[key].className)) {
                    result.push(collection[key]);
                }
            });
            return result;
        });
    }
    provideRouteDefinitions() {
        return this._executeCommand(["debug:router"], (obj) => {
            let result = [];
            Object.keys(obj).forEach(key => {
                if (!this._matchRoutesFilters(key, obj[key].path)) {
                    result.push(new RouteDefinition_1.RouteDefinition(key, obj[key].path, obj[key].method, obj[key].defaults._controller));
                }
            });
            return result;
        });
    }
    provideParameters() {
        return this._executeCommand(["debug:container", "--parameters"], (obj) => {
            let result = [];
            Object.keys(obj).forEach(key => {
                if (!this._matchParametersFilters(key)) {
                    result.push(new Parameter_1.Parameter(key, obj[key]));
                }
            });
            return result;
        });
    }
    _executeCommand(parameters, cb) {
        return new Promise((resolve, reject) => {
            this._getConsolePath().then(infos => {
                let args = [];
                args.push(infos.consolePath);
                args = args.concat(parameters);
                args.push("--format=json");
                let buffer = "";
                let errorBuffer = "";
                try {
                    let executable = this._getPHPExecutablePath();
                    let options = { cwd: infos.cwd };
                    let shellExecutable = false;
                    if (shellExecutable = this._getShellExecutable()) {
                        executable = this._getShellCommand();
                        options = { shell: shellExecutable };
                    }
                    let process = child_process_1.spawn(executable, args, options);
                    process.stdout.on('data', (data) => {
                        buffer += data;
                    });
                    process.stderr.on('data', (data) => {
                        errorBuffer += data;
                    });
                    process.on('error', (err) => {
                        if (this._showErrors) {
                            reject(err.message);
                        }
                        else {
                            resolve([]);
                        }
                    });
                    process.on('close', (code) => {
                        if (code !== 0) {
                            if (this._showErrors) {
                                reject(errorBuffer);
                            }
                            else {
                                resolve([]);
                            }
                        }
                        else {
                            try {
                                let obj = JSON.parse(jsonStripComments(buffer));
                                resolve(cb(obj));
                            }
                            catch (e) {
                                if (this._showErrors) {
                                    reject(e);
                                }
                                else {
                                    resolve([]);
                                }
                            }
                        }
                    });
                }
                catch (e) {
                    if (this._showErrors) {
                        reject(e);
                    }
                    else {
                        resolve([]);
                    }
                }
            }).catch(reason => {
                reject(reason);
            });
        });
    }
    _getConsolePath() {
        return new Promise((resolve, reject) => {
            this._composerJson.initialize().then(infos => {
                let customConsolePath = this._configuration.get("consolePath");
                let consolePath = "";
                if (customConsolePath) {
                    consolePath = customConsolePath + " ";
                }
                else {
                    switch (infos.symfonyVersion) {
                        case 2:
                            consolePath = "app/console";
                            break;
                        case 3:
                        default:
                            consolePath = "bin/console";
                            break;
                    }
                }
                resolve({
                    consolePath: consolePath,
                    cwd: path.dirname(infos.uri.fsPath)
                });
            }).catch(reason => reject(reason));
        });
    }
    _getPHPExecutablePath() {
        return this._configuration.get("phpExecutablePath");
    }
    _getShellExecutable() {
        return this._configuration.get("shellExecutable");
    }
    _getShellCommand() {
        return this._configuration.get("shellCommand");
    }
    _showErrors() {
        return this._configuration.get("showConsoleErrors");
    }
    _matchServicesFilters(serviceId, serviceClassName) {
        let filters = this._configuration.get("servicesFilters");
        return Object.keys(filters).some(filter => {
            if (filters[filter] === "id" && serviceId != null && serviceId.match(new RegExp(filter))) {
                return true;
            }
            else if (filters[filter] === "class" && serviceClassName != null && serviceClassName.match(new RegExp(filter))) {
                return true;
            }
            return false;
        });
    }
    _matchRoutesFilters(routeId, routePath) {
        let filters = this._configuration.get("routesFilters");
        return Object.keys(filters).some(filter => {
            if (filters[filter] === "id" && routeId != null && routeId.match(new RegExp(filter))) {
                return true;
            }
            else if (filters[filter] === "path" && routePath != null && routePath.match(new RegExp(filter))) {
                return true;
            }
            return false;
        });
    }
    _matchParametersFilters(parameterId) {
        let filters = this._configuration.get("parametersFilters");
        return filters.some(filter => {
            return parameterId != null && (parameterId.match(new RegExp(filter)) !== null);
        });
    }
}
exports.ConsoleContainerProvider = ConsoleContainerProvider;
//# sourceMappingURL=ConsoleContainerProvider.js.map