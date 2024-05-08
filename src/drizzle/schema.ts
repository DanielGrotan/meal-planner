import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  unique,
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
    .references(() => ProductsTable.ean, {
      onDelete: "cascade",
    }),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => RecipesTable.id, {
      onDelete: "cascade",
    }),
});

export const ProductsTable = pgTable("products", {
  ean: text("ean").primaryKey(),
  name: text("name").notNull(),
  vendor: text("vendor").notNull(),
  image: text("image"),
  unit: text("unit").notNull(),
  quantity: numeric("quantity").notNull(),
});

export const StorePricesTable = pgTable(
  "store_prices",
  {
    id: serial("id").primaryKey(),
    store: text("store").notNull(),
    storeLogo: text("store_logo"),
    price: numeric("price").notNull(),
    productEan: text("product_ean")
      .notNull()
      .references(() => ProductsTable.ean, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    unq: unique().on(table.store, table.productEan),
  }),
);

export const NutritionInfoTable = pgTable(
  "nutrition_info",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    amount: numeric("amount").notNull(),
    unit: text("unit").notNull(),
    productEan: text("product_ean")
      .notNull()
      .references(() => ProductsTable.ean, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    unq: unique().on(table.name, table.productEan),
  }),
);

export const productsRelations = relations(ProductsTable, ({ many }) => ({
  storePrices: many(StorePricesTable),
  ingredients: many(IngredientsTable),
  nutritionInfo: many(NutritionInfoTable),
}));

export const storePricesRelations = relations(StorePricesTable, ({ one }) => ({
  product: one(ProductsTable, {
    fields: [StorePricesTable.productEan],
    references: [ProductsTable.ean],
  }),
}));

export const ingredientsRelations = relations(IngredientsTable, ({ one }) => ({
  product: one(ProductsTable, {
    fields: [IngredientsTable.productEan],
    references: [ProductsTable.ean],
  }),
  recipe: one(RecipesTable, {
    fields: [IngredientsTable.recipeId],
    references: [RecipesTable.id],
  }),
}));

export const recipesRelations = relations(RecipesTable, ({ many }) => ({
  ingredients: many(IngredientsTable),
}));

export const nutritionInfoRelations = relations(
  NutritionInfoTable,
  ({ one }) => ({
    product: one(ProductsTable, {
      fields: [NutritionInfoTable.productEan],
      references: [ProductsTable.ean],
    }),
  }),
);
