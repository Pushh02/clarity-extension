"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    console.log('🚀 SIMPLE CLARITY EXTENSION ACTIVATED!');
    // Simple completion provider
    const provider = vscode.languages.registerCompletionItemProvider('clarity', {
        provideCompletionItems(document, position) {
            console.log('Completion provider called!');
            return [
                new vscode.CompletionItem('concat', vscode.CompletionItemKind.Function),
                new vscode.CompletionItem('+', vscode.CompletionItemKind.Operator),
                new vscode.CompletionItem('define-public', vscode.CompletionItemKind.Keyword)
            ];
        }
    });
    context.subscriptions.push(provider);
}
exports.activate = activate;
function deactivate() {
    console.log('Simple extension deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=simple-extension.js.map