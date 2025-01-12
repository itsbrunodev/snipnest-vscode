import { type QuickPickItem, window } from "vscode";

type QuickPickWithCallbackOptions = {
  executeCallbackOnInputChange?: boolean;
};

export function quickPickWithCallback<T>(
  placeholder: string,
  callback: (input: string) => Promise<T[]>,
  transformer: (items: T[]) => QuickPickItem[],
  onSelect: (selectedItem: QuickPickItem) => void,
  options: QuickPickWithCallbackOptions = {
    executeCallbackOnInputChange: false,
  }
) {
  const quickPick = window.createQuickPick();

  quickPick.placeholder = placeholder;
  quickPick.busy = false;

  const handleInputChange = async (value: string | null) => {
    if (typeof value === "string" && !value.trim()) {
      quickPick.items = [];
      quickPick.busy = false;
      return;
    }

    quickPick.busy = true;

    try {
      const callbackResults = await callback(value || "");

      const transformedResults = callbackResults
        ? transformer(callbackResults)
        : [];

      quickPick.items = transformedResults;
    } catch (error) {
      console.error(error);

      quickPick.items = [
        { label: "Error fetching results", detail: String(error) },
      ];
    } finally {
      quickPick.busy = false;
    }
  };

  if (options.executeCallbackOnInputChange) {
    quickPick.onDidChangeValue((value) => handleInputChange(value));
  } else {
    handleInputChange(null);
  }

  quickPick.onDidAccept(() => {
    const selectedItem = quickPick.selectedItems[0];

    if (selectedItem) {
      onSelect(selectedItem);
    }

    quickPick.hide();
  });

  quickPick.onDidHide(() => quickPick.dispose());

  quickPick.show();
}

export async function pasteContentAtCursor(
  snippetLanguage: string,
  content: string
): Promise<void> {
  const editor = window.activeTextEditor;

  if (!editor) {
    window.showErrorMessage(
      "No active editor found. Open a file to paste the content."
    );
    return;
  }

  const document = editor.document;
  const fileLanguage = document.languageId;

  if (snippetLanguage !== fileLanguage) {
    const userChoice = await window.showWarningMessage(
      `The snippet's language (${snippetLanguage}) does not match the current file's language (${fileLanguage}). Do you want to paste it anyway?`,
      { modal: true },
      "Yes",
      "No"
    );

    if (userChoice !== "Yes") {
      return;
    }
  }

  editor.edit((editBuilder) => {
    editBuilder.insert(editor.selection.active, content);
  });

  window.showInformationMessage("Snippet pasted successfully.");
}
