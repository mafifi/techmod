/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { action } from '../../_generated/server';
import { v } from 'convex/values';
import { api } from '../../_generated/api';
import type { ActionCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import {
	TaxonomyNodePropsSchema,
	TaxonomyNodeType
} from '../../../lib/modules/spm/domain/TaxonomyNodeDTO';
import type { z } from 'zod';
import { getById, getByName, getChildren, getFullHierarchy } from './query';
import { create, update, deleteNode } from './mutations';

type TaxonomyNodeProps = z.infer<typeof TaxonomyNodePropsSchema>;

// Extended node type with computed fields for display
type TaxonomyNodeDisplay = Doc<'taxonomyNodes'> & {
	_id: Id<'taxonomyNodes'>;
	parentName?: string;
	hierarchyPath?: string;
};

interface TaxonomyHierarchyNode extends TaxonomyNodeDisplay {
	children: TaxonomyHierarchyNode[];
}

interface ExportFormat {
	type: 'json' | 'csv';
	includeMetadata?: boolean;
}

// Error handling types
interface SuccessResult<T> {
	success: true;
	data: T;
}

interface ErrorResult {
	success: false;
	error: string;
}

type ActionResult<T> = SuccessResult<T> | ErrorResult;

// Helper function to handle errors consistently
function handleError(error: unknown): ErrorResult {
	const message = error instanceof Error ? error.message : 'Unknown error occurred';
	return {
		success: false,
		error: message
	};
}

// AI Category Suggestion Types
interface CategorySuggestion {
	taxonomyNodeId: string;
	portfolio: string;
	line: string;
	category: string;
	confidence: number;
	reasoning: string;
	path: string;
}

interface SuggestionResult {
	suggestions: CategorySuggestion[];
	totalCategories: number;
	processingTimeMs: number;
}

// AI-powered category suggestion action
export const suggestCategory = action({
	args: {
		productName: v.string(),
		productDescription: v.optional(v.string())
	},
	handler: async (ctx: ActionCtx, args: { productName: string; productDescription?: string }) => {
		const startTime = Date.now();
		const { productName, productDescription } = args;

		try {
			// Get all categories with their full hierarchy
			const hierarchy = await ctx.runQuery(
				(api as any)['spm/taxonomyNode/query'].getFullHierarchy,
				{ activeOnly: true }
			);

			const categories = extractAllCategories(hierarchy);

			if (categories.length === 0) {
				return {
					suggestions: [],
					totalCategories: 0,
					processingTimeMs: Date.now() - startTime
				};
			}

			// Generate suggestions using AI semantic analysis
			const suggestions = await generateAICategorySuggestions(
				productName,
				productDescription,
				categories
			);

			// Sort by confidence and return top suggestions
			const sortedSuggestions = suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5); // Return top 5 suggestions

			return {
				suggestions: sortedSuggestions,
				totalCategories: categories.length,
				processingTimeMs: Date.now() - startTime
			};
		} catch (error) {
			console.error('Category suggestion error:', error);
			return {
				suggestions: [],
				totalCategories: 0,
				processingTimeMs: Date.now() - startTime,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}
});

// Helper function to extract all categories from hierarchy
function extractAllCategories(hierarchy: any[]): any[] {
	const categories: any[] = [];

	function traverse(nodes: any[], portfolioName = '', lineName = '') {
		for (const node of nodes) {
			if (node.type === 'portfolio') {
				if (node.children) {
					traverse(node.children, node.name, '');
				}
			} else if (node.type === 'line') {
				if (node.children) {
					traverse(node.children, portfolioName, node.name);
				}
			} else if (node.type === 'category') {
				categories.push({
					...node,
					portfolioName,
					lineName,
					path: `${portfolioName} > ${lineName} > ${node.name}`
				});
			}
		}
	}

	traverse(hierarchy);
	return categories;
}

// AI-powered category suggestion using semantic analysis
async function generateAICategorySuggestions(
	productName: string,
	productDescription: string | undefined,
	categories: any[]
): Promise<CategorySuggestion[]> {
	try {
		// Create a context description of available categories
		const categoryContext = categories
			.map((cat) => `- ${cat.path}: ${cat.description || 'No description'}`)
			.join('\n');

		const prompt = `You are an expert at categorizing technology products and services. 

Given this product:
- Name: "${productName}"
- Description: "${productDescription || 'No description provided'}"

Available taxonomy paths:
${categoryContext}

Please analyze the product and suggest the best matching taxonomy paths. Consider:
1. The product's primary function and purpose
2. The technology domain it belongs to
3. How it would typically be categorized in an enterprise IT portfolio

Return your response as a JSON array of suggestions, ordered by confidence (highest first). Each suggestion should have:
- taxonomyNodeId: the category ID
- portfolio: portfolio name
- line: product line name  
- category: category name
- confidence: number between 0 and 1
- reasoning: brief explanation of why this is a good match
- path: full taxonomy path

Example format:
[
  {
    "taxonomyNodeId": "category_id_here",
    "portfolio": "Technology Infrastructure",
    "line": "Cloud Platform", 
    "category": "Compute Services",
    "confidence": 0.95,
    "reasoning": "This appears to be a cloud computing service based on the name and description",
    "path": "Technology Infrastructure > Cloud Platform > Compute Services"
  }
]

Return only valid JSON, no other text:`;

		// Use a simple AI simulation for now (in production, you'd use OpenAI, Claude, etc.)
		const suggestions = await simulateAIAnalysis(productName, productDescription, categories);
		return suggestions;
	} catch (error) {
		console.error('AI suggestion error:', error);
		// Fallback to keyword matching
		return await generateKeywordCategorySuggestions(productName, productDescription, categories);
	}
}

// Fallback keyword-based suggestion algorithm
async function generateKeywordCategorySuggestions(
	productName: string,
	productDescription: string | undefined,
	categories: any[]
): Promise<CategorySuggestion[]> {
	const suggestions: CategorySuggestion[] = [];
	const searchText = `${productName} ${productDescription || ''}`.toLowerCase();

	// Keywords that commonly appear in different technology categories
	const techKeywords: Record<string, string[]> = {
		database: [
			'database',
			'db',
			'sql',
			'nosql',
			'mongodb',
			'postgres',
			'mysql',
			'oracle',
			'redis',
			'data'
		],
		web: ['web', 'website', 'portal', 'frontend', 'backend', 'api', 'rest', 'http', 'browser'],
		mobile: ['mobile', 'ios', 'android', 'app', 'smartphone', 'tablet', 'react native', 'flutter'],
		analytics: [
			'analytics',
			'reporting',
			'dashboard',
			'metrics',
			'kpi',
			'bi',
			'intelligence',
			'visualization'
		],
		security: [
			'security',
			'auth',
			'authentication',
			'authorization',
			'firewall',
			'encryption',
			'ssl',
			'cert'
		],
		cloud: [
			'cloud',
			'aws',
			'azure',
			'gcp',
			'saas',
			'paas',
			'iaas',
			'serverless',
			'container',
			'kubernetes'
		],
		integration: [
			'integration',
			'api',
			'middleware',
			'etl',
			'connector',
			'sync',
			'webhook',
			'message'
		],
		development: [
			'development',
			'dev',
			'code',
			'git',
			'ci',
			'cd',
			'build',
			'deploy',
			'testing',
			'framework'
		],
		monitoring: [
			'monitoring',
			'logging',
			'alerting',
			'performance',
			'uptime',
			'health',
			'metrics',
			'observability'
		],
		collaboration: [
			'collaboration',
			'team',
			'communication',
			'chat',
			'meeting',
			'document',
			'share',
			'workflow'
		],
		crm: ['crm', 'customer', 'sales', 'lead', 'contact', 'opportunity', 'pipeline', 'relationship'],
		erp: ['erp', 'finance', 'accounting', 'inventory', 'supply', 'procurement', 'hr', 'payroll'],
		content: ['content', 'cms', 'document', 'file', 'media', 'asset', 'publish', 'editorial'],
		ecommerce: ['ecommerce', 'commerce', 'shop', 'cart', 'payment', 'checkout', 'product', 'order'],
		network: ['network', 'router', 'switch', 'firewall', 'vpn', 'lan', 'wan', 'dns', 'ip']
	};

	for (const category of categories) {
		let confidence = 0;
		let reasoning = '';
		const reasons: string[] = [];

		// Direct name matching (highest weight)
		const categoryName = category.name.toLowerCase();
		const categoryDescription = category.description.toLowerCase();

		if (searchText.includes(categoryName) || categoryName.includes(productName.toLowerCase())) {
			confidence += 0.4;
			reasons.push(`Product name matches category "${category.name}"`);
		}

		// Description keyword matching
		if (categoryDescription && productDescription) {
			const descWords = productDescription.toLowerCase().split(' ');
			const categoryWords = categoryDescription.split(' ');
			const matchingWords = descWords.filter(
				(word) =>
					word.length > 3 &&
					categoryWords.some((cWord: string) => cWord.includes(word) || word.includes(cWord))
			);

			if (matchingWords.length > 0) {
				confidence += Math.min(0.3, matchingWords.length * 0.1);
				reasons.push(`Description contains related terms: ${matchingWords.slice(0, 3).join(', ')}`);
			}
		}

		// Technology keyword matching
		for (const [techCategory, keywords] of Object.entries(techKeywords)) {
			const matchingKeywords = keywords.filter(
				(keyword) =>
					searchText.includes(keyword) &&
					(categoryName.includes(techCategory) || categoryDescription.includes(keyword))
			);

			if (matchingKeywords.length > 0) {
				confidence += Math.min(0.25, matchingKeywords.length * 0.08);
				reasons.push(`Technology keywords match: ${matchingKeywords.slice(0, 2).join(', ')}`);
			}
		}

		// Portfolio and line context matching
		const portfolioName = category.portfolioName.toLowerCase();
		const lineName = category.lineName.toLowerCase();

		if (searchText.includes(portfolioName) || searchText.includes(lineName)) {
			confidence += 0.15;
			reasons.push(
				`Context matches portfolio/line: ${category.portfolioName} > ${category.lineName}`
			);
		}

		// Boost confidence for categories with good descriptions
		if (categoryDescription && categoryDescription.length > 20) {
			confidence += 0.05;
		}

		// Only include suggestions with reasonable confidence
		if (confidence > 0.1) {
			reasoning = reasons.length > 0 ? reasons.join('; ') : 'Basic keyword matching';

			suggestions.push({
				taxonomyNodeId: category._id,
				portfolio: category.portfolioName,
				line: category.lineName,
				category: category.name,
				confidence: Math.min(confidence, 0.95), // Cap at 95%
				reasoning,
				path: category.path
			});
		}
	}

	return suggestions;
}

// AI simulation function - provides intelligent category suggestions
async function simulateAIAnalysis(
	productName: string,
	productDescription: string | undefined,
	categories: any[]
): Promise<CategorySuggestion[]> {
	const suggestions: CategorySuggestion[] = [];
	const searchText = `${productName} ${productDescription || ''}`.toLowerCase();

	// Smart semantic analysis patterns
	const semanticPatterns = {
		// Infrastructure patterns
		compute: {
			keywords: [
				'server',
				'vm',
				'virtual',
				'compute',
				'cpu',
				'container',
				'kubernetes',
				'docker',
				'ec2',
				'instance'
			],
			portfolio: 'Technology Infrastructure',
			line: 'Cloud Platform',
			category: 'Compute Services'
		},
		storage: {
			keywords: [
				'storage',
				'disk',
				'database',
				'db',
				's3',
				'blob',
				'file',
				'backup',
				'archive',
				'data'
			],
			portfolio: 'Technology Infrastructure',
			line: 'Cloud Platform',
			category: 'Storage Services'
		},
		dataProcessing: {
			keywords: [
				'etl',
				'pipeline',
				'transform',
				'analytics',
				'reporting',
				'dashboard',
				'bi',
				'spark',
				'hadoop'
			],
			portfolio: 'Technology Infrastructure',
			line: 'Data & Analytics',
			category: 'Data Processing'
		},
		// Business application patterns
		webApp: {
			keywords: [
				'web',
				'website',
				'portal',
				'frontend',
				'react',
				'angular',
				'vue',
				'spa',
				'ui',
				'interface'
			],
			portfolio: 'Business Applications',
			line: 'Customer Experience',
			category: 'Web Applications'
		}
		// Add more patterns as needed
	};

	// Analyze each pattern
	for (const [patternName, pattern] of Object.entries(semanticPatterns)) {
		let confidence = 0;
		const matchedKeywords: string[] = [];

		// Check for keyword matches
		for (const keyword of pattern.keywords) {
			if (searchText.includes(keyword)) {
				confidence += 0.1;
				matchedKeywords.push(keyword);
			}
		}

		// Boost confidence for exact matches
		if (searchText.includes(productName.toLowerCase())) {
			confidence += 0.2;
		}

		// Find matching category in the available categories
		const matchingCategory = categories.find(
			(cat) =>
				cat.portfolioName === pattern.portfolio &&
				cat.lineName === pattern.line &&
				cat.name === pattern.category
		);

		if (matchingCategory && confidence > 0.1) {
			const reasoning =
				matchedKeywords.length > 0
					? `Detected ${patternName} characteristics: ${matchedKeywords.join(', ')}`
					: `Product characteristics suggest ${patternName} classification`;

			suggestions.push({
				taxonomyNodeId: matchingCategory._id,
				portfolio: pattern.portfolio,
				line: pattern.line,
				category: pattern.category,
				confidence: Math.min(confidence, 0.95), // Cap at 95%
				reasoning,
				path: matchingCategory.path
			});
		}
	}

	// If no semantic matches, do fuzzy name matching
	if (suggestions.length === 0) {
		for (const category of categories) {
			const nameMatch = calculateNameSimilarity(productName, category.name);
			const descMatch = productDescription
				? calculateNameSimilarity(productDescription, category.description || '')
				: 0;

			const totalMatch = Math.max(nameMatch, descMatch);

			if (totalMatch > 0.3) {
				suggestions.push({
					taxonomyNodeId: category._id,
					portfolio: category.portfolioName,
					line: category.lineName,
					category: category.name,
					confidence: totalMatch * 0.7, // Reduce confidence for fuzzy matching
					reasoning: `Name/description similarity with ${category.name}`,
					path: category.path
				});
			}
		}
	}

	return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

// Helper function to calculate name similarity using simple string matching
function calculateNameSimilarity(str1: string, str2: string): number {
	if (!str1 || !str2) return 0;

	const s1 = str1.toLowerCase();
	const s2 = str2.toLowerCase();

	// Exact match
	if (s1 === s2) return 1.0;

	// Contains match
	if (s1.includes(s2) || s2.includes(s1)) return 0.8;

	// Word overlap
	const words1 = s1.split(/\s+/);
	const words2 = s2.split(/\s+/);
	const commonWords = words1.filter((word) => words2.includes(word));

	if (commonWords.length > 0) {
		return (commonWords.length / Math.max(words1.length, words2.length)) * 0.6;
	}

	return 0;
}

// External integration action placeholders
export const syncWithExternalSystem = action({
	args: {
		nodeId: v.string(),
		externalSystem: v.string(),
		syncDirection: v.union(v.literal('import'), v.literal('export'), v.literal('bidirectional'))
	},
	handler: async (ctx: ActionCtx, args: any) => {
		const { nodeId, externalSystem, syncDirection } = args;

		// Get the node data
		const node: any = await ctx.runQuery((api as any)['spm/taxonomyNode/query'].getById, {
			nodeId
		});
		if (!node) {
			throw new Error('Node not found');
		}

		// TODO: Implement external system integrations
		// This is a placeholder for future external system integrations
		// Examples: ERP systems, CMDB, ServiceNow, etc.

		switch (externalSystem.toLowerCase()) {
			case 'servicenow':
				return await syncWithServiceNow(ctx, node, syncDirection);
			case 'jira':
				return await syncWithJira(ctx, node, syncDirection);
			case 'azure_devops':
				return await syncWithAzureDevOps(ctx, node, syncDirection);
			default:
				throw new Error(`Unsupported external system: ${externalSystem}`);
		}
	}
});

// ServiceNow integration placeholder
async function syncWithServiceNow(ctx: any, node: any, syncDirection: string) {
	// TODO: Implement ServiceNow API integration
	console.log('ServiceNow sync placeholder', { node: node._id, syncDirection });

	return {
		success: true,
		system: 'ServiceNow',
		syncDirection,
		message: 'ServiceNow sync not yet implemented'
	};
}

// Jira integration placeholder
async function syncWithJira(ctx: any, node: any, syncDirection: string) {
	// TODO: Implement Jira API integration
	console.log('Jira sync placeholder', { node: node._id, syncDirection });

	return {
		success: true,
		system: 'Jira',
		syncDirection,
		message: 'Jira sync not yet implemented'
	};
}

// Azure DevOps integration placeholder
async function syncWithAzureDevOps(ctx: any, node: any, syncDirection: string) {
	// TODO: Implement Azure DevOps API integration
	console.log('Azure DevOps sync placeholder', { node: node._id, syncDirection });

	return {
		success: true,
		system: 'Azure DevOps',
		syncDirection,
		message: 'Azure DevOps sync not yet implemented'
	};
}

// Bulk operations for migration and data management
export const bulkImport = action({
	args: {
		nodes: v.array(
			v.object({
				name: v.string(),
				description: v.string(),
				type: v.union(v.literal('portfolio'), v.literal('line'), v.literal('category')),
				parentName: v.optional(v.string()),
				strategy: v.optional(v.string()),
				isActive: v.optional(v.boolean())
			})
		),
		importedBy: v.string(),
		validateHierarchy: v.optional(v.boolean())
	},
	handler: async (ctx: ActionCtx, args: any) => {
		const { nodes, importedBy, validateHierarchy = true } = args;

		const results = [];
		const createdNodes = new Map(); // name -> nodeId mapping

		// Sort nodes by type to ensure proper creation order (portfolio -> line -> category)
		const sortedNodes = (
			[...nodes] as Array<{ type: 'portfolio' | 'line' | 'category' } & Record<string, any>>
		).sort((a, b) => {
			const typeOrder = { portfolio: 0, line: 1, category: 2 };
			return typeOrder[a.type] - typeOrder[b.type];
		});

		for (const nodeData of sortedNodes) {
			try {
				// Find parent ID if parentName is provided
				let parentId = null;

				// Portfolios cannot have parents
				if (nodeData.type === 'portfolio') {
					if (nodeData.parentName) {
						throw new Error(
							`Portfolio '${nodeData.name}' cannot have a parent - portfolios must be top-level`
						);
					}
					parentId = null;
				} else {
					// Lines and categories must have parents
					if (!nodeData.parentName) {
						throw new Error(`${nodeData.type} '${nodeData.name}' must have a parent`);
					}

					if (createdNodes.has(nodeData.parentName)) {
						parentId = createdNodes.get(nodeData.parentName);
					} else {
						// Look for existing parent
						const existingParent: any = await ctx.runQuery(
							(api as any)['spm/taxonomyNode/query'].getByName,
							{
								name: nodeData.parentName
							}
						);
						if (existingParent) {
							parentId = existingParent._id;
						} else if (validateHierarchy) {
							throw new Error(`Parent '${nodeData.parentName}' not found`);
						}
					}
				}

				// Create the node
				const nodeId: Id<'taxonomyNodes'> = await ctx.runMutation(
					(api as any)['spm/taxonomyNode/mutations'].create,
					{
						name: nodeData.name,
						description: nodeData.description,
						type: nodeData.type,
						parentId,
						strategy: nodeData.strategy,
						isActive: nodeData.isActive ?? true,
						createdBy: importedBy,
						updatedBy: importedBy,
						lastModified: Date.now(),
						changeHistory: [],
						version: 1
					}
				);

				createdNodes.set(nodeData.name, nodeId);
				results.push({
					success: true,
					name: nodeData.name,
					nodeId,
					type: nodeData.type
				});
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				results.push({
					success: false,
					name: nodeData.name,
					type: nodeData.type,
					error: errorMessage
				});
			}
		}

		const successCount = results.filter((r) => r.success).length;
		const errorCount = results.length - successCount;

		return {
			totalProcessed: results.length,
			successCount,
			errorCount,
			results
		};
	}
});

export const bulkExport = action({
	args: {
		format: v.union(v.literal('json'), v.literal('csv')),
		includeInactive: v.optional(v.boolean()),
		typeFilter: v.optional(
			v.union(v.literal('portfolio'), v.literal('line'), v.literal('category'))
		)
	},
	handler: async (ctx, args) => {
		const { format, includeInactive = false, typeFilter } = args;

		// Get all nodes with hierarchy
		const hierarchy = await ctx.runQuery((api as any)['spm/taxonomyNode/query'].getFullHierarchy, {
			activeOnly: !includeInactive
		});

		// Flatten hierarchy for export
		const flattenedNodes: TaxonomyNodeDisplay[] = [];

		function flattenHierarchy(nodes: any[], parentPath = '') {
			for (const node of nodes) {
				const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;

				if (!typeFilter || node.type === typeFilter) {
					flattenedNodes.push({
						...node,
						hierarchyPath: currentPath,
						parentName: parentPath.split(' > ').pop() || null
					});
				}

				if (node.children && node.children.length > 0) {
					flattenHierarchy(node.children, currentPath);
				}
			}
		}

		flattenHierarchy(hierarchy);

		if (format === 'csv') {
			// Convert to CSV format
			const headers = [
				'Name',
				'Description',
				'Type',
				'Strategy',
				'Parent',
				'Hierarchy Path',
				'Is Active',
				'Created By',
				'Last Modified'
			];

			const csvRows = flattenedNodes.map((node) => [
				node.name,
				node.description,
				node.type,
				node.strategy || '',
				node.parentName || '',
				node.hierarchyPath,
				node.isActive,
				node.createdBy,
				new Date(node.lastModified).toISOString()
			]);

			return {
				format: 'csv',
				headers,
				data: csvRows,
				count: flattenedNodes.length
			};
		}

		// Return JSON format
		return {
			format: 'json',
			data: flattenedNodes,
			count: flattenedNodes.length
		};
	}
});

// Tree operation utilities
export const calculateTreeMetrics = action({
	args: {
		rootNodeId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { rootNodeId } = args;

		let nodes;
		if (rootNodeId) {
			// Get subtree starting from specified root
			const rootNode = await ctx.runQuery((api as any)['spm/taxonomyNode/query'].getById, {
				nodeId: rootNodeId
			});
			if (!rootNode) {
				throw new Error('Root node not found');
			}

			// Get all descendants
			nodes = await getAllDescendants(ctx, rootNodeId);
			nodes.unshift(rootNode); // Include root in metrics
		} else {
			// Get entire hierarchy
			const hierarchy = await ctx.runQuery(
				(api as any)['spm/taxonomyNode/query'].getFullHierarchy,
				{}
			);
			nodes = flattenHierarchy(hierarchy);
		}

		// Calculate metrics
		const metrics = {
			totalNodes: nodes.length,
			activeNodes: nodes.filter((n) => n.isActive).length,
			inactiveNodes: nodes.filter((n) => !n.isActive).length,
			nodesByType: {
				portfolio: nodes.filter((n) => n.type === 'portfolio').length,
				line: nodes.filter((n) => n.type === 'line').length,
				category: nodes.filter((n) => n.type === 'category').length
			},
			maxDepth: calculateMaxDepth(nodes),
			nodesWithStrategy: nodes.filter((n) => n.strategy).length,
			averageChildrenPerNode: calculateAverageChildren(nodes),
			orphanedNodes: nodes.filter((n) => n.parentId && !nodes.find((p) => p._id === n.parentId))
				.length
		};

		return metrics;
	}
});

// Helper function to get all descendants of a node
async function getAllDescendants(ctx: any, nodeId: string): Promise<any[]> {
	const descendants = [];
	const children = await ctx.runQuery((api as any)['spm/taxonomyNode/query'].getChildren, {
		parentId: nodeId
	});

	for (const child of children) {
		descendants.push(child);
		const grandchildren = await getAllDescendants(ctx, child._id);
		descendants.push(...grandchildren);
	}

	return descendants;
}

// Helper function to flatten hierarchy
function flattenHierarchy(nodes: any[]): any[] {
	const flattened = [];

	for (const node of nodes) {
		flattened.push(node);
		if (node.children && node.children.length > 0) {
			flattened.push(...flattenHierarchy(node.children));
		}
	}

	return flattened;
}

// Helper function to calculate maximum depth
function calculateMaxDepth(nodes: any[]): number {
	let maxDepth = 0;

	for (const node of nodes) {
		let depth = 0;
		let currentNode = node;

		// Walk up the hierarchy to calculate depth
		while (currentNode.parentId) {
			depth++;
			currentNode = nodes.find((n) => n._id === currentNode.parentId);
			if (!currentNode) break; // Prevent infinite loops
		}

		maxDepth = Math.max(maxDepth, depth);
	}

	return maxDepth;
}

// Helper function to calculate average children per node
function calculateAverageChildren(nodes: any[]): number {
	const parentNodes = nodes.filter((n) => nodes.some((child) => child.parentId === n._id));

	if (parentNodes.length === 0) return 0;

	const totalChildren = parentNodes.reduce((sum, parent) => {
		const childrenCount = nodes.filter((n) => n.parentId === parent._id).length;
		return sum + childrenCount;
	}, 0);

	return totalChildren / parentNodes.length;
}

// Cleanup and maintenance operations
export const cleanupOrphanedNodes = action({
	args: {
		updatedBy: v.string(),
		dryRun: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { updatedBy, dryRun = false } = args;

		// Find all nodes
		const allNodes = await ctx.runQuery((api as any)['spm/taxonomyNode/query'].getFullHierarchy, {
			activeOnly: false
		});
		const flatNodes = flattenHierarchy(allNodes);

		// Find orphaned nodes (have parentId but parent doesn't exist)
		const orphanedNodes = [];

		for (const node of flatNodes) {
			if (node.parentId) {
				const parentExists = flatNodes.some((n) => n._id === node.parentId);
				if (!parentExists) {
					orphanedNodes.push(node);
				}
			}
		}

		if (dryRun) {
			return {
				dryRun: true,
				orphanedCount: orphanedNodes.length,
				orphanedNodes: orphanedNodes.map((n) => ({
					id: n._id,
					name: n.name,
					type: n.type,
					missingParentId: n.parentId
				}))
			};
		}

		// Fix orphaned nodes
		let fixedCount = 0;
		for (const orphanedNode of orphanedNodes) {
			if (orphanedNode.type === 'portfolio') {
				// Portfolios can be orphaned (set parentId to null)
				await ctx.runMutation((api as any)['spm/taxonomyNode/mutations'].update, {
					nodeId: orphanedNode._id,
					updates: { parentId: null },
					updatedBy,
					reason: 'Fixed orphaned portfolio by removing parent reference'
				});
			} else {
				// Lines and categories must be deleted if parent doesn't exist
				await ctx.runMutation((api as any)['spm/taxonomyNode/mutations'].deleteNode, {
					nodeId: orphanedNode._id,
					updatedBy,
					forceDelete: true
				});
			}
			fixedCount++;
		}

		return {
			dryRun: false,
			orphanedCount: orphanedNodes.length,
			fixedCount
		};
	}
});
