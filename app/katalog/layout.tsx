import { CatalogShell } from "@/components/catalog/catalog-shell";

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <CatalogShell>{children}</CatalogShell>;
}
