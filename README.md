# Azure SKU Finder

A high-performance, modern web application and utility toolset designed to help cloud architects and developers find the perfect Azure Virtual Machine SKUs. Visualize, filter, and compare Azure VM capabilities with precision and speed.

## ✨ Key Features

### 🔍 Advanced Filtering & Search
*   **Multi-Attribute Range Filtering**: Set **Min/Max** thresholds for:
    *   **vCPUs**: Find precisely the compute power you need.
    *   **RAM (GB)**: Target specific memory requirements.
    *   **Data Disks**: Filter by maximum supported disk count.
    *   **NICs**: Filter by network interface density.
*   **OS Compatibility**: Toggle between **Linux** and **Windows** to see pricing and availability for each OS.
*   **Regional Focus**: Quick switching between global Azure regions.
*   **Feature Tags**: Filter by specialized VM capabilities:
    *   Premium Storage Support
    *   Ephemeral OS Disks
    *   Accelerated Networking
    *   Nested Virtualization
    *   Host Encryption

### 📊 Visualization & Comparison
*   **Dual View Modes**:
    *   **Grid View**: High-level visual cards with key specs and capability badges.
    *   **Table View**: A dense, structured list for side-by-side comparison of multiple SKUs.
*   **Intelligent Sorting**: Sort all SKUs by Name, Family, vCPUs, Memory, Disks, NICs, or Price (Ascending/Descending).
*   **Responsive Design**: optimized for large displays with a sleek, glassmorphic UI.

### ⚙️ Developer Tools & automation
*   **Real-time API Integration**: Directly fetches truth-source data from Azure Resource Manager.
*   **CLI Utilities**:
    *   `node inspect-resource-skus.cjs`: Raw SKU discovery and JSON generation.
    *   `node inspect-vm-full.cjs`: Deep-dive into specific SKU JSON structures.
    *   `node inspect-vm-specs.cjs`: Summary analysis of VM capability sets.

## 🚀 Getting Started

### Prerequisites
*   **Node.js** (v18+)
*   **Azure Service Principal**: Required for data generation scripts (Client ID, Secret, Tenant ID, Subscription ID).

### Setup
1.  **Clone & Install**:
    ```bash
    git clone <repository-url>
    cd az-sku-finder
    npm install
    ```

2.  **Environment Configuration**:
    Create a `.env` file based on `.env.example`:
    ```env
    VITE_AZURE_TENANT_ID=xxx
    VITE_AZURE_CLIENT_ID=xxx
    VITE_AZURE_CLIENT_SECRET=xxx
    VITE_AZURE_SUBSCRIPTION_ID=xxx
    ```

### Usage

#### web UI (Development)
```bash
npm run dev
```
Explore the SKUs at `http://localhost:5173`.

#### Data Generation
To refresh the local SKU database:
```bash
node inspect-resource-skus.cjs
```

## 🏗️ Project Architecture

```text
/
├── src/                # React/TypeScript Application
│   ├── components/     # UI Components (FilterBar, SkuTable, etc.)
│   ├── hooks/          # useSkus custom hook for logic & state
│   ├── services/       # Azure API & Data interaction
│   └── types.ts        # Shared TypeScript definitions
├── scripts/            # Helper scripts
├── public/data/        # Generated SKU JSON storage
└── *.cjs               # Root-level data inspection & generation scripts
```
