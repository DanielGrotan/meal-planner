import {
  integer,
  numeric,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const RecipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  portions: smallint("portions").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const IngredientsTable = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  quantity: numeric("quantity").notNull(),
  productEan: text("product_ean")
    .notNull()
    .references(() => ProductsTable.ean),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => RecipesTable.id),
});

export const ProductsTable = pgTable("products", {
  ean: text("ean").primaryKey(),
  name: text("name").notNull(),
  vendor: text("vendor").notNull(),
  image: text("image"),
  unit: text("unit").notNull(),
  quantity: numeric("quantity").notNull(),
});

export const StorePricesTable = pgTable("store_prices", {
  id: serial("id").primaryKey(),
  store: text("store").notNull(),
  storeLogo: text("store_logo"),
  price: numeric("price").notNull(),
  productEan: text("product_ean").references(() => ProductsTable.ean),
});
