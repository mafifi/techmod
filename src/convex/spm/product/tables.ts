import { defineTable } from 'convex/server';
import { zodOutputToConvex } from 'convex-helpers/server/zod';
import { ProductPropsSchema } from '../../../lib/modules/spm/domain/ProductDTO';

export const products = defineTable(zodOutputToConvex(ProductPropsSchema));
