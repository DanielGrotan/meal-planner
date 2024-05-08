import { Product, ProductProps } from "./product";

type ProductListProps = {
  products: ProductProps[];
};

export function ProductList({ products }: ProductListProps) {
  return (
    <div className="grid grid-cols-6 gap-4">
      {products.map((product) => (
        <Product key={product.ean} {...product} />
      ))}
    </div>
  );
}
