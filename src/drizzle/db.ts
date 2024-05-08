import "@/drizzle/env-config";
import { sql } from "@vercel/postgres";
import { asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

export const db = drizzle(sql, { schema });

export async function getProducts() {
  return db.query.ProductsTable.findMany();
}

export async function getProductsWithStorePrices() {
  return db.query.ProductsTable.findMany({
    with: {
      storePrices: true,
      nutritionInfo: true,
    },
    orderBy: [asc(schema.ProductsTable.name)],
  });
}
