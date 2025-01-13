import { window } from "vscode";

import { pasteContentAtCursor, quickPickWithCallback } from "../lib/vscode";
import { debounce, toKebabCase, toTitleCase } from "../lib/utils";

import type { Snippet } from "../types";

export const searchCommand = "snipnest.search";

export async function searchCommandHandler() {
  const editor = window.activeTextEditor;

  if (!editor) {
    window.showErrorMessage(
      "No active editor found. Open a file and try again."
    );
    return;
  }

  const debouncedFetch = async (query: string) => {
    const debounced = debounce(async () => {
      if (!query.trim()) return [];

      try {
        const response = await fetch(
          `https://snipnest.dev/api/search?query=${encodeURIComponent(query)}`
        );

        return (await response.json()) as Snippet[];
      } catch (error) {
        console.error(error);

        return [];
      }
    }, 200);

    return await debounced();
  };

  quickPickWithCallback<Snippet>(
    "Search...",
    debouncedFetch,
    (results) =>
      typeof results === "undefined"
        ? []
        : results.map(
            ({ metadata: { name, description }, language, category }) => ({
              label: name,
              detail: description,
              description: `${toTitleCase(language)}, ${toTitleCase(category)}`,
              alwaysShow: true,
            })
          ),
    async (selectedItem) => {
      const editor = window.activeTextEditor;

      if (!editor) {
        window.showErrorMessage(
          "No active editor found. Open a file to paste the content."
        );
        return;
      }

      const description = selectedItem.description!.split(", ");
      const language = toKebabCase(description[0]);
      const category = toKebabCase(description[1]);
      const name = toKebabCase(selectedItem.label!);

      const snippetContent = await fetch(
        `https://snipnest.dev/api/${language}/${category}/${name}/raw`
      ).then((res) => res.text());

      pasteContentAtCursor(language, snippetContent);
    },
    {
      executeCallbackOnInputChange: true,
    }
  );
}
