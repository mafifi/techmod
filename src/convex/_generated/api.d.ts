/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as spm_auth_modifiers from "../spm/auth/modifiers.js";
import type * as spm_product_mutations from "../spm/product/mutations.js";
import type * as spm_product_query from "../spm/product/query.js";
import type * as spm_product_tables from "../spm/product/tables.js";
import type * as spm_productPortfolio_action from "../spm/productPortfolio/action.js";
import type * as spm_productPortfolio_mutations from "../spm/productPortfolio/mutations.js";
import type * as spm_productPortfolio_query from "../spm/productPortfolio/query.js";
import type * as spm_productPortfolio_tables from "../spm/productPortfolio/tables.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "spm/auth/modifiers": typeof spm_auth_modifiers;
  "spm/product/mutations": typeof spm_product_mutations;
  "spm/product/query": typeof spm_product_query;
  "spm/product/tables": typeof spm_product_tables;
  "spm/productPortfolio/action": typeof spm_productPortfolio_action;
  "spm/productPortfolio/mutations": typeof spm_productPortfolio_mutations;
  "spm/productPortfolio/query": typeof spm_productPortfolio_query;
  "spm/productPortfolio/tables": typeof spm_productPortfolio_tables;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
