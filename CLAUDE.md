# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build locally
```

## Architecture Overview

This is a React + TypeScript single-page application for browsing Azure VM SKUs. It fetches VM pricing and specifications from Azure APIs and displays them in a filterable, sortable grid or table view.

### Data Flow

1. **AzureService** (`src/services/azureService.ts`) fetches data from two sources:
   - Azure Retail Prices API (public, proxied via Vite at `/api/retail`)
   - Azure Resource SKUs API (requires authentication for exact VM specs)

2. **useSkus hook** (`src/hooks/useSkus.ts`) manages the core state:
   - Fetches SKUs per region with 24-hour localStorage caching
   - Applies filtering (minCpu, minRam, minDisks, minNics)
   - Handles sorting by columns (name, family, vCPUs, MemoryGB, MaxDataDisks, MaxNICs, PricePerHour)
   - Implements pagination (25 items per page)

3. **App.tsx** orchestrates the UI with two view modes: grid (SkuCard) and table (SkuTable)

### Key Types

- **AzureSku** (`src/types.ts`): Core SKU data structure with capabilities array
- **SortConfig/SortKey** (`src/hooks/useSkus.ts`): Sorting state types
- **FilterOptions** (`src/types.ts`): Filter criteria interface

### SKU Parsing

When authenticated Azure API is unavailable, **SkuParser** (`src/services/skuParser.ts`) uses heuristics and a known SKU dictionary (`src/data/knownSkus.ts`) to estimate vCPU/memory specs from SKU names.

### Vite Proxy Configuration

The dev server proxies `/api/retail/*` to `https://prices.azure.com` to avoid CORS issues with the Azure Retail Prices API.
