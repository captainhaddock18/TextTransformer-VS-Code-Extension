const vscode = require('vscode');

function activate(context) {
    console.log('Congratulations, your extension "text-transformer" is now active!');

    // Command for inserting sample text
    let disposableSampleText = vscode.commands.registerCommand('text-transformer.sampletext', function () {
        const fs = require('fs');
        const path = require('path');
        const extpath = context.extensionPath;
        const datapath = path.join(extpath, 'data.json');

        const data = JSON.parse(fs.readFileSync(datapath, 'utf8'));

        const languages = Object.keys(data);
        vscode.window.showQuickPick(languages).then(sel => {
            if (sel) {
                const text = data[sel];
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    editor.edit(editbuilder => {
                        const currentposition = editor.selection.start;
                        editbuilder.insert(currentposition, text);
                    });
                } else {
                    vscode.workspace.openTextDocument({}).then(doc => {
                        vscode.window.showTextDocument(doc).then(editor => {
                            insertSampleText(editor, data, sel);
                        });
                    });
                }
            }
        });
        vscode.window.showInformationMessage('Sample text inserted successfully!');
    });

    // Command for search and replace text
    let disposableSearchAndReplace = vscode.commands.registerCommand('text-transformer.searchandreplace', function () {
        vscode.window.showInputBox({ prompt: 'Enter text to search for:' }).then(searchtext => {
            if (!searchtext) return;
            vscode.window.showInputBox({ prompt: 'Enter replacement text:' }).then(replacetext => {
                if (!replacetext) return;

                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showErrorMessage('No active text editor found.');
                    return;
                }

                const doc = editor.document;
                const text = doc.getText();

                const newtext = text.replace(new RegExp("\\b" + searchtext + "\\b", 'g'), replacetext);

                editor.edit(editbuilder => {
                    const start = new vscode.Position(0, 0);
                    const end = new vscode.Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
                    const range = new vscode.Range(start, end);
                    editbuilder.replace(range, newtext);
                });
                vscode.window.showInformationMessage('Text replaced successfully!');
            });
        });
    });

    // Command for counting word occurrences
    let disposableCountWord = vscode.commands.registerCommand('text-transformer.countword', function () {
        vscode.window.showInputBox({ prompt: 'Enter the word to count:' }).then(searchWord => {
            if (!searchWord) return;

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active text editor found.');
                return;
            }

            const document = editor.document;
            const text = document.getText();

            const regex = new RegExp('\\b' + searchWord + '\\b', 'g');
            const matches = text.match(regex);
            const count = matches ? matches.length : 0;

            vscode.window.showInformationMessage(`The word "${searchWord}" occurs ${count} times.`);
        });
    });

    context.subscriptions.push(disposableSampleText);
    context.subscriptions.push(disposableSearchAndReplace);
    context.subscriptions.push(disposableCountWord);
}

function insertSampleText(editor, data, sel) {
    const sampleText = data[sel];
    editor.edit(editBuilder => {
        const currentPosition = editor.selection.start;
        editBuilder.insert(currentPosition, sampleText);
    });
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
