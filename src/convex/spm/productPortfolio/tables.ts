import { defineTable } from 'convex/server';
import { zodOutputToConvex } from 'convex-helpers/server/zod';
import { ProductPortfolioPropsSchema } from '../../../lib/modules/spm/domain/ProductPortfolioDTO';

export const productPortfolios = defineTable(zodOutputToConvex(ProductPortfolioPropsSchema));
