import { defineSchema } from 'convex/server';
import { products } from './spm/product/tables';
import { productPortfolios } from './spm/productPortfolio/tables';

export default defineSchema({
	products,
	productPortfolios
});
