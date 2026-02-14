# Azure SKU Finder

A modern web application and set of utility scripts designed to inspect, filter, and visualize Azure Virtual Machine (VM) SKUs. Built with React, Vite, Tailwind CSS, and Node.js.

## Features

-   **SKU Inspection**: Fetch and analyze VM capabilities directly from the Azure Management API.
-   **Interactive UI**: Browse and filter SKUs with a responsive React frontend.
-   **Modern Tech Stack**:
    -   ⚡ **Vite** for fast development.
    -   🎨 **Tailwind CSS v4** for utility-first styling.
    -   ✨ **Framer Motion** for smooth interactions.
    -   📦 **Lucide React** for consistent iconography.
-   **Utility Scripts**:
    -   `inspect-resource-skus.cjs`: Fetch raw SKU data.
    -   `inspect-vm-full.cjs`: Detailed inspection of specific VM attributes.
    -   `inspect-vm-specs.cjs`: Analyze specific VM specifications.

## Prerequisites

-   **Node.js** (v18+ recommended)
-   **Azure Subscription** (for API access)
-   **Azure Service Principal** (Client ID, Secret, Tenant ID)

## Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd az-sku-finder
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory based on `.env.example`:

    ```env
    VITE_AZURE_TENANT_ID=your_tenant_id
    VITE_AZURE_CLIENT_ID=your_client_id
    VITE_AZURE_CLIENT_SECRET=your_client_secret
    VITE_AZURE_SUBSCRIPTION_ID=your_subscription_id
    ```

## Usage

### Web Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Utility Scripts

Run the Node.js scripts directly to fetch or inspect data from the terminal:

```bash
# Fetch and save SKU data
node inspect-resource-skus.cjs

# Inspect detailed VM specifications
node inspect-vm-specs.cjs
```


## Project Structure

-   `/src`: React application source code.
    -   `/components`: Reusable UI components.
    -   `/data`: Local JSON data storage.
    -   `/services`: API integration services.
-   `/scripts`: Additional helper scripts.
-   `inspect-*.cjs`: Root-level scripts for direct data inspection.

## License

[MIT](LICENSE)