# TechMod

TechMod is a platform for centrally tracking and managing modernization strategy across the firm. It helps organizations model products, govern lifecycle, categorize with TBM, track usage, score applications, provide modernization pathways, and govern business cases.

## Features

- Model products and their relationships
- Govern product lifecycle and ownership
- Categorize assets using Technology Business Management (TBM) taxonomy
- Track product usage and dependencies
- Score applications based on various criteria
- Provide modernization pathways and recommendations
- Govern business cases and investment decisions

## Tech Stack

- Convex backend for data management and APIs
- Cloudflare Workers for hosting and edge deployment
- SvelteKit frontend for a fast and reactive user interface

## Getting Started

To get started with TechMod, follow these steps:

```sh
# Clone the repository
git clone https://github.com/your-org/techmod.git
cd techmod

# Install dependencies
npm install

# Install playwright, required for merging code into origin
npx playwright install

# Start the development server
npm run dev

# Start Convex dev
npx convex dev

# Build the production version
npm run build
```

## Contributing

We welcome contributions from the community! To contribute, please:

- Fork the repository
- Create a feature branch
- Submit a pull request with a clear description of your changes
- Ensure your code follows the project's coding standards and includes tests where appropriate
- Husky ensures your code checks and passes unit tests before merging. Check issues you need to address with

```sh
# Check code for issues
npm run check

# Check for unit test failures
npm run test:unit
```

## License

This project is licensed under [PLACEHOLDER LICENSE NAME]. See the LICENSE file for details.
