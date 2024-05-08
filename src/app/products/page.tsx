import { ProductList } from "@/components/product-list";
import { getProductsWithStorePrices } from "@/drizzle/db";

export default async function ProductsPage() {
  const products = await getProductsWithStorePrices();

  return (
    <div>
      <h1>Products Page</h1>
      <ProductList products={products} />
    </div>
  );
}
