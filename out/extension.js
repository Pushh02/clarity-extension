"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
const clarityCommandsProvider_1 = require("./clarityCommandsProvider");
const clarityBlockEditorProvider_1 = require("./clarityBlockEditorProvider");
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
            { label: 'define-public', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('(define-public (${1:function-name} (${2:param1} ${3:param-type}))\n  ${4:; body}\n)'), documentation: 'Define a public function' },
            { label: 'define-private', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('(define-private (${1:function-name} (${2:param1} ${3:param-type}))\n  ${4:; body}\n)'), documentation: 'Define a private function' },
            { label: 'define-read-only', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('define-read-only (${1:function-name} (${2:param1} ${3:param-type}))\n  ${4:; body}\n)'), documentation: 'Define a read-only function' },
            { label: 'define-trait', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('(define-trait ${1:trait-name}\n  (${2:function-name} (${3:param1} ${4:param-type}) ${5:return-type})\n)'), documentation: 'Define a trait' },
            { label: 'define-fungible-token', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('(define-fungible-token ${1:token-name}'), documentation: 'Define a fungible token' },
            { label: 'define-non-fungible-token', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('(define-non-fungible-token ${1:token-name}'), documentation: 'Define a non-fungible token' },
            // Constants and Variables
            { label: 'define-constant', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('(define-constant ${1:CONSTANT-NAME} ${2:value})'), documentation: 'Define a constant value' },
            { label: 'define-map', kind: vscode_1.CompletionItemKind.Keyword, insertText: new vscode_1.SnippetString('(define-map ${1:map-name} ${2:key-type} ${3:value-type})'), documentation: 'Define a map' },
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
            // Clarity-specific functions
            { label: 'print', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(print ${1:value})'), documentation: 'Print value to console/emit event' },
            // Unwrapping functions
            { label: 'try!', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(try! ${1:optional-or-response})'), documentation: 'Unwrap optional or response, exit on none/err' },
            { label: 'unwrap!', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(unwrap! ${1:optional-value} ${2:error-value})'), documentation: 'Unwrap optional value or return error' },
            { label: 'unwrap-panic', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(unwrap-panic ${1:optional-value})'), documentation: 'Unwrap optional value or panic' },
            { label: 'unwrap-err!', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(unwrap-err! ${1:response-value} ${2:error-value})'), documentation: 'Unwrap response value or return error' },
            { label: 'unwrap-err-panic', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(unwrap-err-panic ${1:response-value})'), documentation: 'Unwrap response value or panic' },
            // Type checking functions
            { label: 'is-ok', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(is-ok ${1:response-value})'), documentation: 'Check if response is ok' },
            { label: 'is-err', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(is-err ${1:response-value})'), documentation: 'Check if response is error' },
            { label: 'is-some', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(is-some ${1:optional-value})'), documentation: 'Check if optional has value' },
            { label: 'is-none', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(is-none ${1:optional-value})'), documentation: 'Check if optional is none' },
            // Tuple and struct operations
            { label: 'merge', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(merge ${1:tuple1} ${2:tuple2})'), documentation: 'Merge two tuples, second overwrites first' },
            { label: 'get', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(get ${1:field-name} ${2:tuple})'), documentation: 'Get field value from tuple' },
            { label: 'is-eq', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(is-eq ${1:value1} ${2:value2})'), documentation: 'Check if two values are equal' },
            { label: 'asserts!', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(asserts! ${1:condition} ${2:error-code})'), documentation: 'Assert condition or return error' },
            // String operations
            { label: 'string-ascii', kind: vscode_1.CompletionItemKind.Keyword, insertText: 'string-ascii', documentation: 'ASCII string type' },
            { label: 'string-utf8', kind: vscode_1.CompletionItemKind.Keyword, insertText: 'string-utf8', documentation: 'UTF-8 string type' },
            { label: 'concat', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(concat ${1:string1} ${2:string2})'), documentation: 'Concatenate strings' },
            { label: 'str-len', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(str-len ${1:string})'), documentation: 'Get string length' },
            { label: 'str-to-int', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(str-to-int ${1:string})'), documentation: 'Convert string to integer' },
            { label: 'int-to-str', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(int-to-str ${1:integer})'), documentation: 'Convert integer to string' },
            // STX and token operations
            { label: 'stx-transfer?', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(stx-transfer? ${1:amount} ${2:sender} ${3:recipient})'), documentation: 'Transfer STX tokens (returns response)' },
            { label: 'stx-get-balance', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(stx-get-balance ${1:account})'), documentation: 'Get STX balance of account' },
            { label: 'as-contract', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(as-contract ${1:expression})'), documentation: 'Execute expression as contract' },
            { label: 'contract-caller', kind: vscode_1.CompletionItemKind.Function, insertText: 'contract-caller', documentation: 'Get contract caller principal' },
            { label: 'tx-sender', kind: vscode_1.CompletionItemKind.Function, insertText: 'tx-sender', documentation: 'Get transaction sender principal' },
            // Response checking patterns
            { label: 'default-to', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(default-to ${1:default-value} ${2:optional-value})'), documentation: 'Get value from optional or return default' },
            { label: 'expects!', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(expects! ${1:optional-value} ${2:error-code})'), documentation: 'Expect optional to have value or return error' },
            { label: 'expects-err!', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(expects-err! ${1:response-value} ${2:error-code})'), documentation: 'Expect response to be error or return error' },
            // Map operations
            { label: 'map-get', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(map-get? ${1:map-name} ${2:key})'), documentation: 'Get value from map (returns optional)' },
            { label: 'map-set', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(map-set ${1:map-name} ${2:key} ${3:value})'), documentation: 'Set value in map (overwrites existing)' },
            { label: 'map-insert', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(map-insert ${1:map-name} ${2:key} ${3:value})'), documentation: 'Insert value in map (fails if key exists)' },
            { label: 'map-delete', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(map-delete ${1:map-name} ${2:key})'), documentation: 'Delete key from map' },
            { label: 'map-insert!', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(map-insert! ${1:map-name} ${2:key} ${3:value})'), documentation: 'Insert value in map (panics if key exists)' },
            { label: 'map-set!', kind: vscode_1.CompletionItemKind.Function, insertText: new vscode_1.SnippetString('(map-set! ${1:map-name} ${2:key} ${3:value})'), documentation: 'Set value in map (panics if key does not exist)' },
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
// Helper function to check if Clarinet is available
async function isClarinetAvailable() {
    try {
        const { exec } = require('child_process');
        return new Promise((resolve) => {
            exec('clarinet --version', (error) => {
                resolve(!error);
            });
        });
    }
    catch {
        return false;
    }
}
async function activate(context) {
    // Check if Clarinet is available before starting LSP
    const clarinetAvailable = await isClarinetAvailable();
    if (!clarinetAvailable) {
        console.warn('Clarinet is not available. LSP server will not be started.');
        vscode_1.window.showWarningMessage('Clarinet is not installed or not in PATH. LSP features will be limited. Install Clarinet for full functionality.');
    }
    else {
        // Try to start LSP server, but don't fail if it's not available
        try {
            // Check if Clarinet is available
            const command = 'clarinet';
            const args = ['lsp']; // This starts the Clarity LSP server
            const serverOptions = {
                run: { command, args, transport: node_1.TransportKind.stdio },
                debug: { command, args: ['lsp', '--debug'], transport: node_1.TransportKind.stdio }
            };
            const clientOptions = {
                documentSelector: [{ scheme: 'file', language: 'clarity' }],
                synchronize: { fileEvents: vscode_1.workspace.createFileSystemWatcher('**/*.clar') }
            };
            client = new node_1.LanguageClient('clarityLsp', 'Clarity LSP', serverOptions, clientOptions);
            // Start the client and handle errors gracefully
            client.start().catch(error => {
                console.warn('Clarity LSP server failed to start:', error);
                vscode_1.window.showWarningMessage('Clarity LSP server is not available. Autocompletion and other LSP features will be limited. Make sure Clarinet is installed and in your PATH.');
            });
            context.subscriptions.push(client);
            console.log('Clarity LSP client started');
        }
        catch (error) {
            console.warn('Failed to initialize Clarity LSP client:', error);
            vscode_1.window.showWarningMessage('Clarity LSP server is not available. Autocompletion and other LSP features will be limited.');
        }
    }
    // Register the completion provider
    console.log('Registering Clarity completion provider');
    const completionProvider = new ClarityCompletionProvider();
    const disposable = vscode_1.languages.registerCompletionItemProvider('clarity', completionProvider);
    context.subscriptions.push(disposable);
    console.log('Clarity completion provider registered');
    // Register the sidebar tree view providers
    console.log('Registering Clarity sidebar');
    const clarityCommandsProvider = new clarityCommandsProvider_1.ClarityCommandsProvider();
    const clarityBlockEditorProvider = new clarityBlockEditorProvider_1.ClarityBlockEditorProvider();
    vscode_1.window.registerTreeDataProvider('clarityCommands', clarityCommandsProvider);
    vscode_1.window.registerTreeDataProvider('clarityBlockEditor', clarityBlockEditorProvider);
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.refreshCommands', () => clarityCommandsProvider.refresh()));
    console.log('Clarity sidebar registered');
    // Register command handlers for Clarinet commands
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.generateTemplate', () => runClarinetCommand('clarinet new ./smart-contract')));
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.runTest', () => runClarinetCommand('clarinet test')));
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.runConsole', () => runClarinetCommand('clarinet console')));
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.runDeploy', () => runClarinetCommand('clarinet deploy')));
    // Register block editor commands
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.addBlock', (type) => clarityBlockEditorProvider.addBlock(type)));
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.generateCode', () => generateCodeFromBlocks(clarityBlockEditorProvider)));
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.clearBlocks', () => clarityBlockEditorProvider.clearBlocks()));
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.openBlockEditor', () => openBlockEditor()));
    console.log('Clarity commands registered');
}
exports.activate = activate;
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
// Helper function to run Clarinet commands
async function runClarinetCommand(cmd) {
    // Check if a workspace is open (Clarinet expects a project folder)
    if (!vscode_1.workspace.workspaceFolders || vscode_1.workspace.workspaceFolders.length === 0) {
        vscode_1.window.showErrorMessage('Open a Clarity project folder first.');
        return;
    }
    // Get Clarinet path from settings
    const clarinetPath = vscode_1.workspace.getConfiguration('clarity').get('clarinetPath');
    const fullCommand = cmd.replace('clarinet', clarinetPath);
    // Create or reuse a terminal
    const terminalName = 'Clarity Commands';
    let terminal = vscode_1.window.terminals.find(t => t.name === terminalName);
    if (!terminal) {
        terminal = vscode_1.window.createTerminal(terminalName);
    }
    terminal.show();
    // Change to the project directory and run the command
    const projectPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
    terminal.sendText(`cd "${projectPath}"`);
    terminal.sendText(fullCommand);
    // Show a message to the user
    vscode_1.window.showInformationMessage(`Running: ${fullCommand}`);
}
// Helper function to generate code from blocks
async function generateCodeFromBlocks(blockEditorProvider) {
    const generatedCode = blockEditorProvider.generateCode();
    if (!generatedCode.trim()) {
        vscode_1.window.showWarningMessage('No blocks to generate code from. Add some blocks first!');
        return;
    }
    // Show the generated code in a new document
    const doc = await vscode_1.workspace.openTextDocument({
        content: generatedCode,
        language: 'clarity'
    });
    await vscode_1.window.showTextDocument(doc);
    vscode_1.window.showInformationMessage('Generated Clarity code opened in new document!');
}
// Helper function to open block editor
function openBlockEditor() {
    // Focus on the block editor view
    vscode_1.commands.executeCommand('workbench.view.extension.clarity-sidebar');
    vscode_1.commands.executeCommand('workbench.view.extension.clarityBlockEditor');
    vscode_1.window.showInformationMessage('Block Editor opened! Drag and drop blocks to build your Clarity contract.');
}
//# sourceMappingURL=extension.js.map