type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

const CATEGORIES: CategoryRow[] = [
  { id: "c-lips", name: "Lips", slug: "lips", sort_order: 1 },
  { id: "c-nails", name: "Nails", slug: "nails", sort_order: 2 },
  { id: "c-face", name: "Face", slug: "face", sort_order: 3 },
  { id: "c-eyes", name: "Eyes", slug: "eyes", sort_order: 4 },
];

export function listCategoriesFallback(): typeof CATEGORIES {
  return CATEGORIES;
}
