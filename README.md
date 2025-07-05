# SpaceCrawler - Voice AI Content Aggregator

A comprehensive web crawling and content curation system for voice AI-related jobs, events, and products.

## Overview

SpaceCrawler consists of three main applications:

1. **Crawler Service** (`/apps/crawler`): Automated web scrapers for jobs, events, and products
2. **Admin Dashboard** (`/apps/admin`): Review interface for approving/editing crawled content
3. **Public Website** (`/apps/web`): voiceaispace.com where approved content is published

## Quick Start

```bash
# Install dependencies
npm install

# Run all apps in development
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Testing

SpaceCrawler maintains comprehensive test coverage across all applications. See [TESTING.md](./TESTING.md) for detailed testing documentation.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
npm run coverage:report
```

## What's inside?

### Apps and Packages

- `crawler`: Node.js crawler service with Playwright for dynamic content
- `admin`: Next.js admin dashboard for content moderation
- `web`: Next.js public website displaying approved content
- `@repo/ui`: Shared React components
- `@repo/eslint-config`: Shared ESLint configurations
- `@repo/typescript-config`: Shared TypeScript configurations
- `@repo/tailwind-config`: Shared Tailwind CSS configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Building packages/ui

This example is set up to produce compiled styles for `ui` components into the `dist` directory. The component `.tsx` files are consumed by the Next.js apps directly using `transpilePackages` in `next.config.ts`. This was chosen for several reasons:

- Make sharing one `tailwind.config.ts` to apps and packages as easy as possible.
- Make package compilation simple by only depending on the Next.js Compiler and `tailwindcss`.
- Ensure Tailwind classes do not overwrite each other. The `ui` package uses a `ui-` prefix for it's classes.
- Maintain clear package export boundaries.

Another option is to consume `packages/ui` directly from source without building. If using this option, you will need to update the `tailwind.config.ts` in your apps to be aware of your package locations, so it can find all usages of the `tailwindcss` class names for CSS compilation.

For example, in [tailwind.config.ts](packages/tailwind-config/tailwind.config.ts):

```js
  content: [
    // app content
    `src/**/*.{js,ts,jsx,tsx}`,
    // include packages if not transpiling
    "../../packages/ui/*.{js,ts,jsx,tsx}",
  ],
```

If you choose this strategy, you can remove the `tailwindcss` and `autoprefixer` dependencies from the `ui` package.

### Utilities

This Turborepo has some additional tools already setup for you:

- [Tailwind CSS](https://tailwindcss.com/) for styles
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
