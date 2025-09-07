"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
let client;
// Clarity autocompletion provider
class ClarityCompletionProvider {
    provideCompletionItems(document, position, token, context) {
        console.log('ClarityCompletionProvider: provideCompletionItems called');
        const completions = [];
        // Get the current line text up to the cursor position
        const lineText = document.lineAt(position).text.substring(0, position.character);
        console.log('Current line text:', lineText);
        // Basic Clarity keywords and functions
        const clarityKeywords = [
            // Define statements
            { label: 'define-public', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('define-public (${1:function-name} (${2:param1} ${3:param-type}))\n  ${4:; body}\n)'), documentation: 'Define a public function' },
            { label: 'define-private', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('define-private (${1:function-name} (${2:param1} ${3:param-type}))\n  ${4:; body}\n)'), documentation: 'Define a private function' },
            { label: 'define-read-only', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('define-read-only (${1:function-name} (${2:param1} ${3:param-type}))\n  ${4:; body}\n)'), documentation: 'Define a read-only function' },
            { label: 'define-trait', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('define-trait ${1:trait-name}\n  (${2:function-name} (${3:param1} ${4:param-type}) ${5:return-type})\n)'), documentation: 'Define a trait' },
            { label: 'define-fungible-token', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('define-fungible-token ${1:token-name}'), documentation: 'Define a fungible token' },
            { label: 'define-non-fungible-token', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('define-non-fungible-token ${1:token-name}'), documentation: 'Define a non-fungible token' },
            // Control flow
            { label: 'if', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('(if ${1:condition}\n  ${2:then-expression}\n  ${3:else-expression}\n)'), documentation: 'Conditional expression' },
            { label: 'when', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('(when ${1:condition}\n  ${2:then-expression}\n)'), documentation: 'Conditional expression without else' },
            { label: 'match', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('(match ${1:value}\n  ${2:pattern1} ${3:expression1}\n  ${4:pattern2} ${5:expression2}\n)'), documentation: 'Pattern matching' },
            // Loops and iteration
            { label: 'map', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(map ${1:function} ${2:list})'), documentation: 'Apply function to each element in list' },
            { label: 'filter', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(filter ${1:function} ${2:list})'), documentation: 'Filter list based on predicate' },
            { label: 'fold', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(fold ${1:function} ${2:initial} ${3:list})'), documentation: 'Reduce list to single value' },
            // Arithmetic operations
            { label: '+', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(+ ${1:num1} ${2:num2})'), documentation: 'Addition' },
            { label: '-', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(- ${1:num1} ${2:num2})'), documentation: 'Subtraction' },
            { label: '*', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(* ${1:num1} ${2:num2})'), documentation: 'Multiplication' },
            { label: '/', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(/ ${1:num1} ${2:num2})'), documentation: 'Division' },
            { label: 'mod', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(mod ${1:num1} ${2:num2})'), documentation: 'Modulo' },
            { label: 'pow', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(pow ${1:base} ${2:exponent})'), documentation: 'Power' },
            // Comparison operations
            { label: '=', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(= ${1:val1} ${2:val2})'), documentation: 'Equality' },
            { label: '!=', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(!= ${1:val1} ${2:val2})'), documentation: 'Inequality' },
            { label: '<', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(< ${1:val1} ${2:val2})'), documentation: 'Less than' },
            { label: '<=', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(<= ${1:val1} ${2:val2})'), documentation: 'Less than or equal' },
            { label: '>', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(> ${1:val1} ${2:val2})'), documentation: 'Greater than' },
            { label: '>=', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(>= ${1:val1} ${2:val2})'), documentation: 'Greater than or equal' },
            // Boolean operations
            { label: 'and', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(and ${1:expr1} ${2:expr2})'), documentation: 'Logical AND' },
            { label: 'or', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(or ${1:expr1} ${2:expr2})'), documentation: 'Logical OR' },
            { label: 'not', kind: vscode_1.CompletionItemKind.Operator, insertText: new vscode_1.SnippetString('(not ${1:expression})'), documentation: 'Logical NOT' },
            // String operations
            { label: 'concat', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(concat ${1:string1} ${2:string2})'), documentation: 'Concatenate strings' },
            { label: 'str-len', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(str-len ${1:string})'), documentation: 'Get string length' },
            { label: 'str-to-int', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(str-to-int ${1:string})'), documentation: 'Convert string to integer' },
            { label: 'int-to-str', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(int-to-str ${1:integer})'), documentation: 'Convert integer to string' },
            // List operations
            { label: 'list', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(list ${1:item1} ${2:item2})'), documentation: 'Create a list' },
            { label: 'len', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(len ${1:list})'), documentation: 'Get list length' },
            { label: 'append', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(append ${1:list} ${2:item})'), documentation: 'Append item to list' },
            { label: 'concat', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(concat ${1:list1} ${2:list2})'), documentation: 'Concatenate lists' },
            // Data types
            { label: 'ok', kind: vscode_1.CompletionItemKind.Value, insertText: 'ok', documentation: 'Ok response type' },
            { label: 'err', kind: vscode_1.CompletionItemKind.Value, insertText: new vscode_1.SnippetString('(err ${1:error-code})'), documentation: 'Error response type' },
            { label: 'some', kind: vscode_1.CompletionItemKind.Value, insertText: new vscode_1.SnippetString('(some ${1:value})'), documentation: 'Some optional value' },
            { label: 'none', kind: vscode_1.CompletionItemKind.Value, insertText: 'none', documentation: 'None optional value' },
            // Comments
            { label: 'comment', kind: vscode_1.CompletionItemKind.Snippet, insertText: new vscode_1.SnippetString(';; ${1:comment}'), documentation: 'Add a comment' }
        ];
        // Add all completions
        clarityKeywords.forEach(keyword => {
            const item = new vscode_1.CompletionItem(keyword.label, keyword.kind);
            item.insertText = keyword.insertText;
            item.documentation = new vscode_1.MarkdownString(keyword.documentation);
            completions.push(item);
        });
        return completions;
    }
}
function activate(context) {
    // Assume Clarinet is in PATH; adjust if needed
    const command = 'clarinet';
    const args = ['lsp']; // This starts the Clarity LSP server (confirm in Clarinet docs if not exact)
    const serverOptions = {
        run: { command, args, transport: node_1.TransportKind.stdio },
        debug: { command, args: ['lsp', '--debug'], transport: node_1.TransportKind.stdio }
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'clarity' }],
        synchronize: { fileEvents: vscode_1.workspace.createFileSystemWatcher('**/*.clar') }
    };
    client = new node_1.LanguageClient('clarityLsp', 'Clarity LSP', serverOptions, clientOptions);
    client.start();
    context.subscriptions.push(client);
    // Register the completion provider
    console.log('Registering Clarity completion provider');
    const completionProvider = new ClarityCompletionProvider();
    const disposable = vscode_1.languages.registerCompletionItemProvider('clarity', completionProvider);
    context.subscriptions.push(disposable);
    console.log('Clarity completion provider registered');
}
exports.activate = activate;
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map