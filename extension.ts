import { workspace, ExtensionContext, CompletionItemProvider, CompletionItem, CompletionItemKind, TextDocument, Position, CancellationToken, CompletionContext, SnippetString, MarkdownString, languages } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient;

// Clarity autocompletion provider
class ClarityCompletionProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): CompletionItem[] {
    console.log('ClarityCompletionProvider: provideCompletionItems called');
    const completions: CompletionItem[] = [];
    
    // Get the current line text up to the cursor position
    const lineText = document.lineAt(position).text.substring(0, position.character);
    console.log('Current line text:', lineText);
    
    // Basic Clarity keywords and functions
    const clarityKeywords = [
      // Define statements
      { label: 'define-public', kind: CompletionItemKind.Keyword, insertText: new SnippetString('define-public (${1:function-name} (${2:param1} ${3:param-type}))\n  ${4:; body}\n)'), documentation: 'Define a public function' },
      { label: 'define-private', kind: CompletionItemKind.Keyword, insertText: new SnippetString('define-private (${1:function-name} (${2:param1} ${3:param-type}))\n  ${4:; body}\n)'), documentation: 'Define a private function' },
      { label: 'define-read-only', kind: CompletionItemKind.Keyword, insertText: new SnippetString('define-read-only (${1:function-name} (${2:param1} ${3:param-type}))\n  ${4:; body}\n)'), documentation: 'Define a read-only function' },
      { label: 'define-trait', kind: CompletionItemKind.Keyword, insertText: new SnippetString('define-trait ${1:trait-name}\n  (${2:function-name} (${3:param1} ${4:param-type}) ${5:return-type})\n)'), documentation: 'Define a trait' },
      { label: 'define-fungible-token', kind: CompletionItemKind.Keyword, insertText: new SnippetString('define-fungible-token ${1:token-name}'), documentation: 'Define a fungible token' },
      { label: 'define-non-fungible-token', kind: CompletionItemKind.Keyword, insertText: new SnippetString('define-non-fungible-token ${1:token-name}'), documentation: 'Define a non-fungible token' },
      
      // Control flow
      { label: 'if', kind: CompletionItemKind.Keyword, insertText: new SnippetString('(if ${1:condition}\n  ${2:then-expression}\n  ${3:else-expression}\n)'), documentation: 'Conditional expression' },
      { label: 'when', kind: CompletionItemKind.Keyword, insertText: new SnippetString('(when ${1:condition}\n  ${2:then-expression}\n)'), documentation: 'Conditional expression without else' },
      { label: 'match', kind: CompletionItemKind.Keyword, insertText: new SnippetString('(match ${1:value}\n  ${2:pattern1} ${3:expression1}\n  ${4:pattern2} ${5:expression2}\n)'), documentation: 'Pattern matching' },
      
      // Loops and iteration
      { label: 'map', kind: CompletionItemKind.Function, insertText: new SnippetString('(map ${1:function} ${2:list})'), documentation: 'Apply function to each element in list' },
      { label: 'filter', kind: CompletionItemKind.Function, insertText: new SnippetString('(filter ${1:function} ${2:list})'), documentation: 'Filter list based on predicate' },
      { label: 'fold', kind: CompletionItemKind.Function, insertText: new SnippetString('(fold ${1:function} ${2:initial} ${3:list})'), documentation: 'Reduce list to single value' },
      
      // Arithmetic operations
      { label: '+', kind: CompletionItemKind.Operator, insertText: new SnippetString('(+ ${1:num1} ${2:num2})'), documentation: 'Addition' },
      { label: '-', kind: CompletionItemKind.Operator, insertText: new SnippetString('(- ${1:num1} ${2:num2})'), documentation: 'Subtraction' },
      { label: '*', kind: CompletionItemKind.Operator, insertText: new SnippetString('(* ${1:num1} ${2:num2})'), documentation: 'Multiplication' },
      { label: '/', kind: CompletionItemKind.Operator, insertText: new SnippetString('(/ ${1:num1} ${2:num2})'), documentation: 'Division' },
      { label: 'mod', kind: CompletionItemKind.Operator, insertText: new SnippetString('(mod ${1:num1} ${2:num2})'), documentation: 'Modulo' },
      { label: 'pow', kind: CompletionItemKind.Operator, insertText: new SnippetString('(pow ${1:base} ${2:exponent})'), documentation: 'Power' },
      
      // Comparison operations
      { label: '=', kind: CompletionItemKind.Operator, insertText: new SnippetString('(= ${1:val1} ${2:val2})'), documentation: 'Equality' },
      { label: '!=', kind: CompletionItemKind.Operator, insertText: new SnippetString('(!= ${1:val1} ${2:val2})'), documentation: 'Inequality' },
      { label: '<', kind: CompletionItemKind.Operator, insertText: new SnippetString('(< ${1:val1} ${2:val2})'), documentation: 'Less than' },
      { label: '<=', kind: CompletionItemKind.Operator, insertText: new SnippetString('(<= ${1:val1} ${2:val2})'), documentation: 'Less than or equal' },
      { label: '>', kind: CompletionItemKind.Operator, insertText: new SnippetString('(> ${1:val1} ${2:val2})'), documentation: 'Greater than' },
      { label: '>=', kind: CompletionItemKind.Operator, insertText: new SnippetString('(>= ${1:val1} ${2:val2})'), documentation: 'Greater than or equal' },
      
      // Boolean operations
      { label: 'and', kind: CompletionItemKind.Operator, insertText: new SnippetString('(and ${1:expr1} ${2:expr2})'), documentation: 'Logical AND' },
      { label: 'or', kind: CompletionItemKind.Operator, insertText: new SnippetString('(or ${1:expr1} ${2:expr2})'), documentation: 'Logical OR' },
      { label: 'not', kind: CompletionItemKind.Operator, insertText: new SnippetString('(not ${1:expression})'), documentation: 'Logical NOT' },
      
      // String operations
      { label: 'concat', kind: CompletionItemKind.Function, insertText: new SnippetString('(concat ${1:string1} ${2:string2})'), documentation: 'Concatenate strings' },
      { label: 'str-len', kind: CompletionItemKind.Function, insertText: new SnippetString('(str-len ${1:string})'), documentation: 'Get string length' },
      { label: 'str-to-int', kind: CompletionItemKind.Function, insertText: new SnippetString('(str-to-int ${1:string})'), documentation: 'Convert string to integer' },
      { label: 'int-to-str', kind: CompletionItemKind.Function, insertText: new SnippetString('(int-to-str ${1:integer})'), documentation: 'Convert integer to string' },
      
      // List operations
      { label: 'list', kind: CompletionItemKind.Function, insertText: new SnippetString('(list ${1:item1} ${2:item2})'), documentation: 'Create a list' },
      { label: 'len', kind: CompletionItemKind.Function, insertText: new SnippetString('(len ${1:list})'), documentation: 'Get list length' },
      { label: 'append', kind: CompletionItemKind.Function, insertText: new SnippetString('(append ${1:list} ${2:item})'), documentation: 'Append item to list' },
      { label: 'concat', kind: CompletionItemKind.Function, insertText: new SnippetString('(concat ${1:list1} ${2:list2})'), documentation: 'Concatenate lists' },
      
      // Data types
      { label: 'ok', kind: CompletionItemKind.Value, insertText: 'ok', documentation: 'Ok response type' },
      { label: 'err', kind: CompletionItemKind.Value, insertText: new SnippetString('(err ${1:error-code})'), documentation: 'Error response type' },
      { label: 'some', kind: CompletionItemKind.Value, insertText: new SnippetString('(some ${1:value})'), documentation: 'Some optional value' },
      { label: 'none', kind: CompletionItemKind.Value, insertText: 'none', documentation: 'None optional value' },
      
      // Comments
      { label: 'comment', kind: CompletionItemKind.Snippet, insertText: new SnippetString(';; ${1:comment}'), documentation: 'Add a comment' }
    ];
    
    // Add all completions
    clarityKeywords.forEach(keyword => {
      const item = new CompletionItem(keyword.label, keyword.kind);
      item.insertText = keyword.insertText;
      item.documentation = new MarkdownString(keyword.documentation);
      completions.push(item);
    });
    
    return completions;
  }
}

export function activate(context: ExtensionContext) {
  // Assume Clarinet is in PATH; adjust if needed
  const command = 'clarinet';
  const args = ['lsp'];  // This starts the Clarity LSP server (confirm in Clarinet docs if not exact)

  const serverOptions: ServerOptions = {
    run: { command, args, transport: TransportKind.stdio },
    debug: { command, args: ['lsp', '--debug'], transport: TransportKind.stdio }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'clarity' }],
    synchronize: { fileEvents: workspace.createFileSystemWatcher('**/*.clar') }
  };

  client = new LanguageClient(
    'clarityLsp',
    'Clarity LSP',
    serverOptions,
    clientOptions
  );

  client.start();
  context.subscriptions.push(client);
  
  // Register the completion provider
  console.log('Registering Clarity completion provider');
  const completionProvider = new ClarityCompletionProvider();
  const disposable = languages.registerCompletionItemProvider('clarity', completionProvider);
  context.subscriptions.push(disposable);
  console.log('Clarity completion provider registered');
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}