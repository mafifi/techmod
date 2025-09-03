import { defineSchema } from 'convex/server';
import { products } from './spm/product/tables';
import { taxonomyNodes } from './spm/taxonomyNode/tables';

export default defineSchema({
	products,
	taxonomyNodes
});
