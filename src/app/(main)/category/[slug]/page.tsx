import { CategoryView } from "./category-view";
import { CATEGORIES } from "@/lib/constants";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default function CategoryPage() {
  return <CategoryView />;
}
