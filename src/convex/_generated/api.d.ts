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
import type * as spm_taxonomyNode_action from "../spm/taxonomyNode/action.js";
import type * as spm_taxonomyNode_index from "../spm/taxonomyNode/index.js";
import type * as spm_taxonomyNode_mutations from "../spm/taxonomyNode/mutations.js";
import type * as spm_taxonomyNode_query from "../spm/taxonomyNode/query.js";
import type * as spm_taxonomyNode_tables from "../spm/taxonomyNode/tables.js";
import type * as spm_taxonomyNode_trigger from "../spm/taxonomyNode/trigger.js";


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
  "spm/taxonomyNode/action": typeof spm_taxonomyNode_action;
  "spm/taxonomyNode/index": typeof spm_taxonomyNode_index;
  "spm/taxonomyNode/mutations": typeof spm_taxonomyNode_mutations;
  "spm/taxonomyNode/query": typeof spm_taxonomyNode_query;
  "spm/taxonomyNode/tables": typeof spm_taxonomyNode_tables;
  "spm/taxonomyNode/trigger": typeof spm_taxonomyNode_trigger;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
