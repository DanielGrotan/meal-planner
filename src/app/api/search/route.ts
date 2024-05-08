import { db } from "@/drizzle/db";
import { ProductsTable, StorePricesTable } from "@/drizzle/schema";
import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

const searchParamsSchema = z.object({
  query: z.string(),
  page: z.number().int().positive(),
});

const productsResponseSchema = z.object({
  data: z.array(z.any()),
  links: z.object({
    first: z
      .string()
      .nullable()
      .transform((val) => !!val),
    last: z
      .string()
      .nullable()
      .transform((val) => !!val),
    prev: z
      .string()
      .nullable()
      .transform((val) => !!val),
    next: z
      .string()
      .nullable()
      .transform((val) => !!val),
  }),
});

const productSchema = z.object({
  name: z.string(),
  vendor: z.string(),
  ean: z.string(),
  image: z.string().nullable(),
  current_price: z.number().transform((val) => val.toString()),
  weight: z.number().transform((val) => val.toString()),
  weight_unit: z.union([
    z.literal("ml"),
    z.literal("l"),
    z.literal("g"),
    z.literal("kg"),
  ]),
  store: z.object({
    name: z.string(),
    logo: z.string().nullable(),
  }),
});

type RealProduct = {
  name: string;
  vendor: string;
  ean: string;
  image: string | null;
  current_price: string;
  weight: string;
  weight_unit: string;
  store: {
    name: string;
    logo: string | null;
  };
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const params = searchParamsSchema.safeParse({
    query: searchParams.get("query"),
    page: searchParams.get("page") || 1,
  });

  if (!params.success) {
    return new Response(`Bad Request: ${params.error.message}`, {
      status: 400,
    });
  }

  const { query, page } = params.data;

  const res = await fetch(
    `https://kassal.app/api/v1/products?search=${query}&page=${page}&size=100&exclude_without_ean`,
    {
      headers: {
        Authorization: `Bearer ${process.env.KASSALAPP_API_KEY}`,
      },
    },
  );

  if (res.status === 429) {
    return new Response("Too Many Requests", {
      status: 429,
    });
  }

  const data = await res.json();
  const parsedResponse = productsResponseSchema.safeParse(data);

  if (!parsedResponse.success) {
    console.error(parsedResponse.error.message);
    // console.log(data);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  const result = parsedResponse.data;
  const products = result.data
    .filter((product) => productSchema.safeParse(product).success)
    .map((product) => productSchema.parse(product));

  console.log(products);

  if (products.length === 0) {
    return Response.json({
      products,
      links: result.links,
    });
  }

  const eanToProduct = new Map<string, RealProduct>();

  for (const product of products) {
    if (eanToProduct.has(product.ean)) {
      continue;
    }

    eanToProduct.set(product.ean, product);
  }

  const productsToStore = Array.from(eanToProduct.values()).map((product) => ({
    ean: product.ean,
    name: product.name,
    vendor: product.vendor,
    image: product.image,
    unit: product.weight_unit,
    quantity: product.weight,
  }));

  const storePricesToStore = products.map((product) => ({
    store: product.store.name,
    storeLogo: product.store.logo,
    price: product.current_price,
    productEan: product.ean,
  }));

  await db.transaction(async (tx) => {
    await tx
      .insert(ProductsTable)
      .values(productsToStore)
      .onConflictDoNothing();

    await tx
      .insert(StorePricesTable)
      .values(storePricesToStore)
      .onConflictDoUpdate({
        target: [StorePricesTable.store, StorePricesTable.productEan],
        set: {
          price: sql`excluded.price`,
          storeLogo: sql`excluded.store_logo`,
        },
      });
  });

  return Response.json({
    products,
    links: result.links,
  });
}
