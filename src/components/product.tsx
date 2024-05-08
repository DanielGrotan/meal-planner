import {
  NutritionInfoTable,
  ProductsTable,
  StorePricesTable,
} from "@/drizzle/schema";
import { InferSelectModel } from "drizzle-orm";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

export type ProductProps = InferSelectModel<typeof ProductsTable> & {
  storePrices: InferSelectModel<typeof StorePricesTable>[];
  nutritionInfo: InferSelectModel<typeof NutritionInfoTable>[];
};

export function Product({
  name,
  image,
  vendor,
  quantity,
  unit,
  ean,
  storePrices,
  nutritionInfo,
}: ProductProps) {
  nutritionInfo.sort((a, b) => b.name.length - a.name.length);

  return (
    <Card className="flex flex-col justify-end">
      <CardHeader>
        <CardTitle className="break-words text-center">{name}</CardTitle>
        <CardDescription className="text-center">{`${quantity} ${unit}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">View Nutrition Info</Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-center">
            {nutritionInfo.map((info) => (
              <div key={info.id} className="flex flex-col">
                <span className="font-semibold">{info.name}</span>
                <span className="text-muted-foreground">{`${info.amount} ${info.unit}`}</span>
              </div>
            ))}
          </DialogContent>
        </Dialog>

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
