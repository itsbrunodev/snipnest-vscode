import { type QuickPickItem, window } from "vscode";

import { pasteContentAtCursor, quickPickWithCallback } from "../lib/vscode";
import { toKebabCase, toTitleCase } from "../lib/utils";
import type { Snippet } from "../types";

export const browseCommand = "snipnest.browse";

export async function browseCommandHandler() {
  try {
    async function fetchLanguages() {
      const response = await fetch("https://snipnest.dev/api/languages");
      return (await response.json()) as string[];
    }

    const selectedLanguageItem = await new Promise<QuickPickItem | undefined>(
      (resolve) => {
        quickPickWithCallback(
          "Select a language",
          fetchLanguages,
          (languages) =>
            languages.map(
              (language) => ({ label: toTitleCase(language) }) as QuickPickItem
            ),
          (item) => resolve(item)
        );
      }
    );

    if (!selectedLanguageItem) return;

    const selectedLanguage = toKebabCase(selectedLanguageItem.label);

    async function fetchCategories() {
      const response = await fetch(
        `https://snipnest.dev/api/${selectedLanguage}`
      );
      return (await response.json()) as string[];
    }

    const selectedCategoryItem = await new Promise<QuickPickItem | undefined>(
      (resolve) => {
        quickPickWithCallback<string>(
          `Select a category for ${toTitleCase(selectedLanguage)}`,
          fetchCategories,
          (categories) =>
            categories.map(
              (category) =>
                ({
                  label: toTitleCase(category),
                }) as QuickPickItem
            ),
          (item) => resolve(item)
        );
      }
    );

    if (!selectedCategoryItem) return;

    const selectedCategory = toKebabCase(selectedCategoryItem.label);

    async function fetchSnippets() {
      const response = await fetch(
        `https://snipnest.dev/api/${selectedLanguage}/${selectedCategory}`
      );
      return (await response.json()) as Snippet[];
    }

    const selectedSnippetItem = await new Promise<QuickPickItem | undefined>(
      (resolve) => {
        quickPickWithCallback(
          `Select a snippet from ${toTitleCase(selectedLanguage)}/${toTitleCase(selectedCategory)}`,
          fetchSnippets,
          (snippets) =>
            snippets.map(
              ({ metadata: { name, description }, language, category }) =>
                ({
                  label: name,
                  detail: description,
                  description: `${toTitleCase(language)}, ${toTitleCase(category)}`,
                }) as QuickPickItem
            ),
          (item) => resolve(item)
        );
      }
    );

    if (!selectedSnippetItem) return;

    const selectedSnippet = toKebabCase(selectedSnippetItem.label);

    const snippetContent = await fetch(
      `https://snipnest.dev/api/${selectedLanguage}/${selectedCategory}/${selectedSnippet}/raw`
    ).then((res) => res.text());

    pasteContentAtCursor(selectedLanguage, snippetContent);
  } catch (error) {
    console.error("An error occurred in browseCommandHandler:", error);
    window.showErrorMessage("Failed to browse snippets. Please try again.");
  }
}
