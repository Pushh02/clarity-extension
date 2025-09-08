"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const fs_1 = require("fs");
const path_1 = require("path");
const clarityCommandsProvider_1 = require("./clarityCommandsProvider");
const clarityBlockEditorProvider_1 = require("./clarityBlockEditorProvider");
const clarityDiagnosticProvider_1 = require("./clarityDiagnosticProvider");
const testGenerator_1 = require("./testGenerator");
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
    // Temporarily disable LSP server to prevent crashes
    // TODO: Re-enable LSP server once Clarinet LSP is stable
    console.log('Clarity LSP server is temporarily disabled to prevent crashes');
    // Check if Clarinet is available for CLI commands
    const clarinetAvailable = await isClarinetAvailable();
    if (!clarinetAvailable) {
        console.warn('Clarinet is not available. CLI commands will not work.');
        vscode_1.window.showWarningMessage('Clarinet is not installed or not in PATH. CLI commands will not work. Install Clarinet for full functionality.');
    }
    else {
        console.log('Clarinet is available. CLI commands will work.');
    }
    // Register the completion provider
    console.log('Registering Clarity completion provider');
    const completionProvider = new ClarityCompletionProvider();
    const disposable = vscode_1.languages.registerCompletionItemProvider('clarity', completionProvider);
    context.subscriptions.push(disposable);
    console.log('Clarity completion provider registered');
    // Register the diagnostic provider for syntax error detection
    console.log('Registering Clarity diagnostic provider');
    const diagnosticProvider = new clarityDiagnosticProvider_1.ClarityDiagnosticProvider();
    diagnosticProvider.activate(context);
    context.subscriptions.push(diagnosticProvider);
    // Register command to clear diagnostics
    const clearDiagnosticsCommand = vscode_1.commands.registerCommand('clarity.clearDiagnostics', () => {
        const activeEditor = vscode_1.window.activeTextEditor;
        if (activeEditor && activeEditor.document.languageId === 'clarity') {
            diagnosticProvider.clearDiagnostics(activeEditor.document);
            vscode_1.window.showInformationMessage('Clarity diagnostics cleared');
        }
    });
    context.subscriptions.push(clearDiagnosticsCommand);
    // Register command to manually check diagnostics
    const checkDiagnosticsCommand = vscode_1.commands.registerCommand('clarity.checkDiagnostics', () => {
        const activeEditor = vscode_1.window.activeTextEditor;
        if (activeEditor && activeEditor.document.languageId === 'clarity') {
            // Access the private method through any
            diagnosticProvider.checkSyntax(activeEditor.document);
            vscode_1.window.showInformationMessage('Clarity diagnostics checked');
        }
    });
    context.subscriptions.push(checkDiagnosticsCommand);
    console.log('Clarity diagnostic provider registered');
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
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.runTest', () => generateAITests()));
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.runConsole', () => runClarinetCommand('clarinet console')));
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.generateDeployment', () => generateDeployment()));
    context.subscriptions.push(vscode_1.commands.registerCommand('clarity.runDeploy', () => testIndividualFunctions()));
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
        console.log('No LSP client to stop');
        return undefined;
    }
    console.log('Stopping LSP client');
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
// Helper function to run Clarinet commands with input
async function runClarinetCommandWithInput(cmd, inputCommand) {
    // Check if a workspace is open (Clarinet expects a project folder)
    if (!vscode_1.workspace.workspaceFolders || vscode_1.workspace.workspaceFolders.length === 0) {
        vscode_1.window.showErrorMessage('Open a Clarity project folder first.');
        return;
    }
    // Get Clarinet path from settings
    const clarinetPath = vscode_1.workspace.getConfiguration('clarity').get('clarinetPath');
    const fullCommand = cmd.replace('clarinet', clarinetPath);
    // Create or reuse a terminal
    const terminalName = 'Clarity Console';
    let terminal = vscode_1.window.terminals.find(t => t.name === terminalName);
    if (!terminal) {
        terminal = vscode_1.window.createTerminal(terminalName);
    }
    terminal.show();
    // Change to the project directory and run the command
    const projectPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
    // Send commands with proper timing
    terminal.sendText(`cd "${projectPath}" && ${fullCommand}`);
    // Wait for the console to start, then send the input commands
    setTimeout(() => {
        if (terminal) {
            console.log('Sending commands to terminal:', inputCommand);
            // Split commands by newlines and send them with delays
            const commands = inputCommand.split('\n').filter(cmd => cmd.trim());
            commands.forEach((command, index) => {
                setTimeout(() => {
                    if (terminal) {
                        console.log(`Sending command ${index + 1}:`, command);
                        terminal.sendText(command);
                        terminal.sendText('\r');
                    }
                }, index * 2000); // 2 second delay between commands
            });
        }
    }, 5000);
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
// Helper function to generate AI-powered tests
async function generateAITests() {
    try {
        const testGenerator = new testGenerator_1.TestGenerator();
        await testGenerator.generateTests();
    }
    catch (error) {
        console.error('Error generating AI tests:', error);
        vscode_1.window.showErrorMessage(`Failed to generate AI tests: ${error}`);
    }
}
// Helper function to generate Clarinet deployment
async function generateDeployment() {
    // Check if a workspace is open
    if (!vscode_1.workspace.workspaceFolders || vscode_1.workspace.workspaceFolders.length === 0) {
        vscode_1.window.showErrorMessage('Open a Clarity project folder first.');
        return;
    }
    // Show network selection dialog
    const networks = [
        { label: 'Mainnet', value: 'mainnet' },
        { label: 'Testnet', value: 'testnet' },
        { label: 'Devnet', value: 'devnet' },
        { label: 'Local', value: 'local' }
    ];
    const selectedNetwork = await vscode_1.window.showQuickPick(networks, {
        placeHolder: 'Select network for deployment generation',
        title: 'Generate Clarinet Deployment'
    });
    if (!selectedNetwork) {
        return;
    }
    // Run the deployment generation command
    const command = `clarinet deployments generate --${selectedNetwork.value}`;
    await runClarinetCommand(command);
}
// Helper function to test individual functions
async function testIndividualFunctions() {
    // Check if a workspace is open
    if (!vscode_1.workspace.workspaceFolders || vscode_1.workspace.workspaceFolders.length === 0) {
        vscode_1.window.showErrorMessage('Open a Clarity project folder first.');
        return;
    }
    try {
        // Find all .clar files
        const clarFiles = await vscode_1.workspace.findFiles('**/*.clar');
        if (clarFiles.length === 0) {
            vscode_1.window.showWarningMessage('No .clar files found in the workspace.');
            return;
        }
        // Parse functions from all .clar files
        const allFunctions = [];
        for (const file of clarFiles) {
            const content = (0, fs_1.readFileSync)(file.fsPath, 'utf8');
            const functions = parseClarityFunctions(content, file.fsPath);
            allFunctions.push(...functions);
        }
        if (allFunctions.length === 0) {
            vscode_1.window.showWarningMessage('No functions found in .clar files.');
            return;
        }
        // Show function selection
        const functionItems = allFunctions.map(func => ({
            label: func.name,
            description: `${func.contractName} - ${func.type} (${func.parameters.length} params)`,
            detail: func.signature,
            function: func
        }));
        const selectedFunction = await vscode_1.window.showQuickPick(functionItems, {
            placeHolder: 'Select a function to test',
            title: 'Test Individual Function'
        });
        if (!selectedFunction) {
            return;
        }
        // Test the selected function
        await testFunction(selectedFunction.function);
    }
    catch (error) {
        console.error('Error testing functions:', error);
        vscode_1.window.showErrorMessage(`Failed to test functions: ${error}`);
    }
}
// Parse Clarity functions from file content
function parseClarityFunctions(content, filePath) {
    const functions = [];
    const contractName = (0, path_1.basename)(filePath, '.clar');
    // Regex patterns for different function types
    const patterns = [
        {
            type: 'public',
            regex: /\(define-public\s+\(([^\s)]+)\s+([^)]+)\)/g
        },
        {
            type: 'private',
            regex: /\(define-private\s+\(([^\s)]+)\s+([^)]+)\)/g
        },
        {
            type: 'read-only',
            regex: /\(define-read-only\s+\(([^\s)]+)\s+([^)]+)\)/g
        }
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.regex.exec(content)) !== null) {
            const functionName = match[1].trim();
            const parametersStr = match[2].trim();
            // Parse parameters
            const parameters = parseParameters(parametersStr);
            // Create signature
            const signature = `(${functionName} ${parametersStr})`;
            functions.push({
                name: functionName,
                type: pattern.type,
                contractName,
                parameters,
                signature,
                filePath
            });
        }
    }
    return functions;
}
// Parse function parameters
function parseParameters(parametersStr) {
    console.log('Parsing parameters from:', parametersStr);
    if (!parametersStr || parametersStr === '()') {
        return [];
    }
    const parameters = [];
    // Handle parameters in format: (amount uint) or (from principal) (amount uint)
    // First try to match individual parameter groups like (amount uint)
    const paramMatches = parametersStr.match(/\(([^)]+)\s+([^)]+)\)/g);
    console.log('Param matches:', paramMatches);
    if (paramMatches) {
        for (const match of paramMatches) {
            const paramContent = match.slice(1, -1); // Remove outer parentheses
            const parts = paramContent.split(/\s+/);
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const type = parts.slice(1).join(' ').trim(); // Join remaining parts as type
                parameters.push({ name, type });
                console.log('Parsed parameter:', { name, type });
            }
        }
    }
    else {
        // Handle single parameter without parentheses like: amount uint
        const singleParamMatch = parametersStr.match(/^(\w+)\s+(\w+)$/);
        if (singleParamMatch) {
            const name = singleParamMatch[1].trim();
            const type = singleParamMatch[2].trim();
            parameters.push({ name, type });
            console.log('Parsed single parameter:', { name, type });
        }
        else {
            // Fallback for simple parameters
            const paramPairs = parametersStr.match(/(\w+)\s+(\w+)/g);
            console.log('Simple param pairs:', paramPairs);
            if (paramPairs) {
                for (const pair of paramPairs) {
                    const [name, type] = pair.split(/\s+/);
                    parameters.push({ name: name.trim(), type: type.trim() });
                    console.log('Parsed simple parameter:', { name, type });
                }
            }
        }
    }
    console.log('Final parameters:', parameters);
    return parameters;
}
// Test a specific function
async function testFunction(func) {
    try {
        console.log('Testing function:', func);
        // Show parameter input dialog
        const parameterValues = await getParameterValues(func);
        if (parameterValues === undefined) {
            return; // User cancelled
        }
        console.log('Parameter values:', parameterValues);
        // Read the original file to get the complete function definition
        const originalFile = await vscode_1.workspace.openTextDocument(func.filePath);
        const fileContent = originalFile.getText();
        // Extract the complete function definition
        const functionCode = extractFunctionDefinition(fileContent, func);
        if (!functionCode) {
            vscode_1.window.showErrorMessage(`Could not find function definition for ${func.name}`);
            return;
        }
        // Create a temporary .clar file with the function in the contracts directory
        const contractsDir = (0, path_1.join)(vscode_1.workspace.workspaceFolders[0].uri.fsPath, 'contracts');
        const tempFileName = `temp_test_${func.name}_${Date.now()}`;
        const tempFilePath = (0, path_1.join)(contractsDir, `${tempFileName}.clar`);
        const tempFileContent = createTempClarityFile(functionCode, func, parameterValues);
        // Ensure contracts directory exists
        try {
            await vscode_1.workspace.fs.createDirectory(vscode_1.Uri.file(contractsDir));
        }
        catch (error) {
            // Directory might already exist, ignore error
        }
        await vscode_1.workspace.fs.writeFile(vscode_1.Uri.file(tempFilePath), Buffer.from(tempFileContent, 'utf8'));
        console.log('Created temporary file:', tempFilePath);
        // Execute the function definition first, then the test call
        console.log('Executing function definition and test call...');
        const functionDefinition = functionCode.trim();
        const testCall = `(${func.name}${parameterValues.length > 0 ? ` ${parameterValues.join(' ')}` : ''})`;
        // Send function definition first and wait for it to complete
        await sendToClarinetConsole(functionDefinition);
        // Wait for the function definition to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Then send the test call
        await sendToClarinetConsole(testCall);
        // Clean up the temporary file after a delay
        setTimeout(async () => {
            try {
                await vscode_1.workspace.fs.delete(vscode_1.Uri.file(tempFilePath));
                console.log('Cleaned up temporary file:', tempFilePath);
            }
            catch (error) {
                console.error('Error cleaning up temporary file:', error);
            }
        }, 5000);
    }
    catch (error) {
        console.error('Error testing function:', error);
        vscode_1.window.showErrorMessage(`Failed to test function: ${error}`);
    }
}
// Get parameter values from user
async function getParameterValues(func) {
    console.log('Getting parameter values for function:', func.name);
    console.log('Function parameters:', func.parameters);
    if (func.parameters.length === 0) {
        // No parameters, just run the function
        console.log('No parameters found');
        return [];
    }
    const parameterValues = [];
    for (let i = 0; i < func.parameters.length; i++) {
        const param = func.parameters[i];
        console.log(`Getting value for parameter ${i + 1}/${func.parameters.length}:`, param);
        const value = await vscode_1.window.showInputBox({
            prompt: `Enter value for parameter ${i + 1}/${func.parameters.length}: ${param.name} (${param.type})`,
            placeHolder: `e.g., ${getExampleValue(param.type)}`,
            validateInput: (value) => validateParameterValue(value, param.type)
        });
        if (value === undefined) {
            return undefined; // User cancelled
        }
        parameterValues.push(value);
        console.log(`Added parameter value: ${value}`);
    }
    console.log('All parameter values:', parameterValues);
    return parameterValues;
}
// Get example value for parameter type
function getExampleValue(type) {
    const examples = {
        'uint': 'u100',
        'int': 'i100',
        'bool': 'true',
        'string-ascii': '"hello"',
        'string-utf8': 'u"hello"',
        'principal': 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        'list': '(list u1 u2 u3)',
        'tuple': '(tuple (key "value"))',
        'optional': '(some u100)',
        'response': '(ok u100)'
    };
    return examples[type] || 'value';
}
// Validate parameter value
function validateParameterValue(value, type) {
    if (!value.trim()) {
        return 'Parameter value cannot be empty';
    }
    // Basic validation based on type
    switch (type) {
        case 'uint':
            if (!value.match(/^u\d+$/)) {
                return 'Invalid uint format. Use: u123';
            }
            break;
        case 'int':
            if (!value.match(/^i-?\d+$/)) {
                return 'Invalid int format. Use: i123 or i-123';
            }
            break;
        case 'bool':
            if (!['true', 'false'].includes(value)) {
                return 'Invalid bool format. Use: true or false';
            }
            break;
        case 'string-ascii':
            if (!value.startsWith('"') || !value.endsWith('"')) {
                return 'Invalid string-ascii format. Use: "hello"';
            }
            break;
        case 'string-utf8':
            if (!value.startsWith('u"') || !value.endsWith('"')) {
                return 'Invalid string-utf8 format. Use: u"hello"';
            }
            break;
    }
    return undefined;
}
// Create test command for the function
function createTestCommand(func, parameterValues) {
    const paramStr = parameterValues.length > 0 ? ` ${parameterValues.join(' ')}` : '';
    // Use the correct Clarinet console syntax with dot notation
    return `(contract-call? .${func.contractName} ${func.name}${paramStr})`;
}
// Helper function to get alternative command formats
function getAlternativeCommands(func, parameterValues) {
    const paramStr = parameterValues.length > 0 ? ` ${parameterValues.join(' ')}` : '';
    return [
        `(contract-call? .${func.contractName} ${func.name}${paramStr})`,
        `(${func.name}${paramStr})`,
        `(contract-call? '${func.contractName} ${func.name}${paramStr})`,
        `(contract-call? .${func.contractName.toLowerCase()} ${func.name}${paramStr})`,
        `(contract-call? .${func.contractName.toUpperCase()} ${func.name}${paramStr})`
    ];
}
// Extract complete function definition from file content
function extractFunctionDefinition(fileContent, func) {
    const lines = fileContent.split('\n');
    let inFunction = false;
    let braceCount = 0;
    let functionLines = [];
    let startLine = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for function definition start
        if (!inFunction) {
            const functionPattern = new RegExp(`\\(define-(public|private|read-only)\\s+\\(${func.name}\\s+`);
            if (functionPattern.test(line)) {
                inFunction = true;
                startLine = i;
                functionLines.push(line);
                // Count opening braces in this line
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;
                continue;
            }
        }
        if (inFunction) {
            functionLines.push(line);
            // Count braces to find the end of the function
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;
            // If we've closed all braces, we've found the end
            if (braceCount === 0) {
                break;
            }
        }
    }
    return inFunction ? functionLines.join('\n') : null;
}
// Send command directly to existing Clarinet console
async function sendToClarinetConsole(command) {
    const terminalName = 'Clarity Console';
    let terminal = vscode_1.window.terminals.find(t => t.name === terminalName);
    if (!terminal) {
        // Start Clarinet console if it doesn't exist
        console.log('Starting Clarinet console...');
        terminal = vscode_1.window.createTerminal(terminalName);
        // Check if a workspace is open
        if (!vscode_1.workspace.workspaceFolders || vscode_1.workspace.workspaceFolders.length === 0) {
            vscode_1.window.showErrorMessage('Open a Clarity project folder first.');
            return;
        }
        // Get Clarinet path from settings
        const clarinetPath = vscode_1.workspace.getConfiguration('clarity').get('clarinetPath');
        const projectPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
        // Start the console
        terminal.sendText(`cd "${projectPath}" && ${clarinetPath} console`);
        terminal.show();
        // Wait for console to start before sending commands
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    terminal.show();
    console.log('Sending command to console:', command);
    terminal.sendText(command);
    terminal.sendText('\r');
}
// Create temporary Clarity file content
function createTempClarityFile(functionCode, func, parameterValues) {
    const paramStr = parameterValues.length > 0 ? ` ${parameterValues.join(' ')}` : '';
    const testCall = `(${func.name}${paramStr})`;
    // Return just the test call - the function should already be defined in the console
    return testCall;
}
//# sourceMappingURL=extension.js.map