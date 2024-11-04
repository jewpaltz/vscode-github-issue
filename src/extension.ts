import * as vscode from 'vscode';
import simpleGit from 'simple-git';
import { parse } from 'path';
//import fetch from 'node-fetch';

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

    const repoUrl = await getRepoUrl(filePath);
    const issueUrl = constructIssueUrl(repoUrl, filePath, line);

    vscode.env.openExternal(vscode.Uri.parse(issueUrl));
  });

  context.subscriptions.push(disposable);
}

async function getRepoUrl(filePath: string): Promise<string> {

    try {
        const path = parse(filePath);
        const git = simpleGit(path.dir.substring(1)); // Remove leading slash
        const remotes = await git.getRemotes(true);
        const originRemote = remotes.find(remote => remote.name === 'origin');
        const repoUrl = originRemote ? originRemote.refs.fetch : 'https://github.com/your-username/your-repo'; // Fallback URL

        if (originRemote) {
            const repoPath = repoUrl.replace('https://github.com/', '');
            const apiUrl = `https://api.github.com/repos/${repoPath}`;
            const response = await fetch(apiUrl);
            const repoData = await response.json() as { fork: boolean, parent: { html_url: string } };

            if (repoData.fork && repoData.parent) {
            return repoData.parent.html_url;
            }
        }

        return repoUrl;
    }catch(e){
        console.error(e);
    }
    return ''
}

function constructIssueUrl(repoUrl: string, filePath: string, line: number): string {
  const permalink = `${repoUrl}/blob/main${filePath}#L${line}`;
  const issueBody = `### Issue found at [this line](${permalink})`;
  return `${repoUrl}/issues/new?body=${encodeURIComponent(issueBody)}`;
}

export function deactivate() {}