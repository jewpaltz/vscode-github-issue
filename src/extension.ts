import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.createGithubIssue', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const line = selection.active.line + 1;
    const filePath = document.uri.path;
    const repoUrl = 'https://github.com/your-username/your-repo'; // Replace with your repo URL

    const permalink = `${repoUrl}/blob/main${filePath}#L${line}`;
    const issueBody = `### Issue found at [this line](${permalink})`;

    const issueUrl = `${repoUrl}/issues/new?body=${encodeURIComponent(issueBody)}`;
    vscode.env.openExternal(vscode.Uri.parse(issueUrl));
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}