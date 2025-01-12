export interface Snippet {
  language: string;
  category: string;
  name: string;
  metadata: {
    name: string;
    description: string;
    contributors: string[];
  };
}
