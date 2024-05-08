import { ProductsTable, StorePricesTable } from "@/drizzle/schema";
import { InferSelectModel } from "drizzle-orm";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export type ProductProps = InferSelectModel<typeof ProductsTable> & {
  storePrices: InferSelectModel<typeof StorePricesTable>[];
};

export function Product({
  name,
  image,
  vendor,
  quantity,
  unit,
  ean,
  storePrices,
}: ProductProps) {
  return (
    <Card className="flex flex-col justify-end">
      <CardHeader>
        <CardTitle className="break-words text-center">{name}</CardTitle>
        <CardDescription className="text-center">{`${quantity} ${unit}`}</CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="relative aspect-square bg-white">
          {image && (
            <Image
              unoptimized
              src={image}
              alt={name}
              className="object-contain"
              fill
            />
          )}
        </div>
        <div
          className="flex justify-center gap-2
        pt-10"
        >
          {storePrices.map((storePrice) => (
            <div
              key={storePrice.id}
              className="flex flex-col items-center justify-start gap-2 text-center"
            >
              {storePrice.storeLogo && (
                <Image
                  unoptimized
                  src={storePrice.storeLogo}
                  alt={storePrice.store}
                  width={30}
                  height={30}
                />
              )}
              <span className="text-xs text-muted-foreground">{`${storePrice.price} kr`}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
