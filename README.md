<div align="center">

# 🌾 CropShock Intelligence Platform
### Enterprise Agricultural Supply Chain, Multi-Mandi Arbitrage & Perishability Shock Lakehouse

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PySpark](https://img.shields.io/badge/Apache_Spark-3.5-E25A1C.svg?style=for-the-badge&logo=apachespark&logoColor=white)](https://spark.apache.org/)
[![DuckDB](https://img.shields.io/badge/DuckDB-1.0+-FFF000.svg?style=for-the-badge&logo=duckdb&logoColor=black)](https://duckdb.org/)
[![Power BI](https://img.shields.io/badge/Power_BI-Star_Schema-F2C811.svg?style=for-the-badge&logo=powerbi&logoColor=black)](https://powerbi.microsoft.com/)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT_HS256-000000.svg?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Tests](https://img.shields.io/badge/Tests-9%2F9_Passed-10B981.svg?style=for-the-badge&logo=pytest&logoColor=white)](backend/test_api.py)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br/>

<img src="docs/screenshots/hero_banner.svg" alt="CropShock Hero Banner" width="100%" />

<p align="center">
  <b>A production-grade Big Data Lakehouse &amp; Analytical Intelligence Platform monitoring spot auctions, spatial arbitrage, and climate-induced supply volatility across all 33 Districts and 40 APMC wholesale mandis of Gujarat.</b>
</p>

[Explore Features](#-interactive-ui-showcase--visual-slider) •
[Architecture](#-medallion-lakehouse-architecture) •
[Star Schema & BI](#-kimball-star-schema--power-bi-integration) •
[API Reference](#-rest-api-documentation) •
[Quick Start](#-quick-start-guide)

</div>

---

## 📌 Executive Summary & Problem Statement

### The Agricultural Supply Chain Crisis in Gujarat

In India's primary agricultural corridors—particularly the state of **Gujarat**—horticultural markets suffer from severe systemic vulnerabilities:

1. **Extreme Perishability & Spoilage**: Fresh vegetables (tomatoes, chillies, leafy greens) possess ambient shelf-lives of merely 24 to 72 hours. Unanticipated harvest gluts or localized rainfall cause up to **30%–40% post-harvest spoilage** before crops reach consumer terminals.
2. **Inter-Mandi Price Dispersion (The Arbitrage Opportunity)**: Spot prices across regional APMCs diverge by **15% to 35% on the exact same morning** due to fragmented discovery. For example, Cabbage trading at ₹1,249/Qtl in Gondal (Saurashtra) often commands ₹1,446/Qtl in Ahmedabad (Central Gujarat). Without real-time Haversine freight models, food processors and FPOs cannot capitalize on this spread.
3. **Information Asymmetry**: Smallholder farmers and Farmer Producer Organizations (FPOs) lack access to statewide volume forecasts, leaving them vulnerable to distress sales at local mandi gates.
4. **Why APMC Mandis Rather Than Individual Villages?**: Under the *Gujarat Agricultural Produce Markets Act (1963)*, statutory weighing scales, regulated auction pits, and transparent daily price reporting occur at the **APMC Market Yards and Sub-Market Yards (મુખ્ય તથા ઉપ બજાર યાર્ડ)** at the Taluka/District level. Each APMC yard serves as the natural economic funnel for 50 to 200+ surrounding villages (a 15–40 km catchment radius).

### The Solution: CropShock

**CropShock** bridges this gap by unifying Agmarknet spot auctions, Open-Meteo microclimate telemetry, and highway logistics into an **automated Medallion Lakehouse**. It powers:
- Transparent price discovery and real-time **Supply Shock Z-Scores**.
- Vectorized **Haversine Freight Optimization** identifying the lowest landed procurement cost.
- Permanent **Database-Persisted Sourcing Contracts**.
- **Role-Based Access Control (RBAC)** across 4 enterprise stakeholder personas.
- **Power BI / Tableau Kimball Star Schema** export ready for corporate intelligence.

---

## 🎬 Live Interactive Walkthrough & Video Showcase

> **Watch the Platform in Action**: Experience seamless switching across 4 stakeholder roles, real-time spatial heatmaps, multi-mandi arbitrage calculations, and database-persisted contract routing.

<div align="center">
  <a href="https://youtu.be/demo_placeholder" target="_blank">
    <img src="docs/screenshots/hero_banner.svg" alt="Watch CropShock Platform Demo" width="90%" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 20px 40px rgba(0,0,0,0.5);" />
  </a>
  <p><i>▶️ Click to watch the full platform walkthrough video (Live UI, API dispatch &amp; Data Pipeline)</i></p>
</div>

---

## 🖼️ Interactive UI Showcase & Visual Slider

Explore the 8 specialized command views built with **React 19**, **TypeScript**, and **Lucide Icons**:

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/dashboard_overview.png" alt="Executive Overview" width="100%" />
      <br/>
      <b>1. Executive Command Center &amp; RBAC</b>
      <p><i>Statewide agricultural telemetry, 4-persona RBAC, and operational command cards.</i></p>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/market_pulse_map.png" alt="Gujarat Market Pulse Map" width="100%" />
      <br/>
      <b>2. Gujarat Market Pulse (Interactive Vector Map)</b>
      <p><i>All 33 districts, 40 APMC nodes, and catchment radius inspection drawer.</i></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/arbitrage_matrix.png" alt="Arbitrage Engine" width="100%" />
      <br/>
      <b>3. Cross-Mandi Arbitrage Matrix</b>
      <p><i>Multi-mandi spread detection with active benchmark chips and quick regional presets.</i></p>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/procurement_planner.png" alt="Haversine Route Engine" width="100%" />
      <br/>
      <b>4. Automated Procurement Simulator</b>
      <p><i>Haversine cartage modeling with live SQLite/FastAPI contract persistence.</i></p>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="docs/screenshots/powerbi_export.png" alt="Power BI Export Center" width="100%" />
      <br/>
      <b>5. Enterprise Kimball Star Schema Export Center</b>
      <p><i>Direct CSV exports (Dim_Market, Dim_Commodity, Fact_Arrivals) with verified DAX formulas.</i></p>
    </td>
  </tr>
</table>

### 🔎 Deep-Dive Feature Breakdown

<details open>
<summary><b>1. Executive Command Center & Stakeholder RBAC</b></summary>
<br/>

- **Statewide High-Level KPIs**: Daily aggregated volume (MT), weighted average modal price, active mandi counters, and critical supply shocks.
- **Dynamic Stakeholder Adaptation**: The command center alters its advisory highlights and action shortcuts according to the active role:
  - **B2B Buyer**: Landed price optimization, active suppliers, cost savings counter.
  - **FPO Collective**: Member realization yield, cooperative pooling dispatch.
  - **APMC Official**: Statutory market cess monitoring, arrival compliance.
  - **Data Engineer**: Pipeline latency, quarantine rejection rates, DuckDB executor status.

</details>

<details>
<summary><b>2. Geospatial Market Pulse (Interactive Gujarat APMC Map)</b></summary>
<br/>

- **SVG Interactive Topography**: Vectorized map of Gujarat depicting all 33 districts across 5 agro-climatic zones (*Saurashtra, Central Gujarat, South Gujarat, North Gujarat, Kutch*).
- **Proportional Volumetric Bubbles**: Node radiuses dynamic to arrival tonnage; color-coded by spot modal prices.
- **Click-to-Inspect Telemetry**: Instant drawer showing 7-day arrival trends, modal spreads, and local weather.

</details>

<details>
<summary><b>3. Cross-Mandi Arbitrage Matrix</b></summary>
<br/>

- **Dynamic Multi-Mandi Benchmarking**: Select 2 to 5 Gujarat mandis simultaneously to compute inter-mandi gross margin spreads.
- **Clean Chip Management**: Active benchmark chips with 1-click removal (`×`), live search, and regional grouping tabs.
- **Spread & Divergence Counters**: Instant metrics for *Max Spread (₹/Qtl)*, *Arbitrage Potential (+% divergence)*, *Lowest Source Mandi*, and *Highest Premium Mandi*.

</details>

<details>
<summary><b>4. Vegetable Intelligence & Perishability Analyzer</b></summary>
<br/>

- **40 Monitored Vegetable Crops**: Exhaustive coverage across Solanaceous, Root/Tuber, Cucurbit, Allium, and Legume groups with Gujarati vernacular names (*બટાટા, ડુંગળી, ટામેટા, લીલી મકાઈ, વગેરે*).
- **Perishability Tiers**:
  - *Tier 1 (Critical Perishability — 1-3 days)*: Leafy greens, fresh coriander, vine tomatoes.
  - *Tier 2 (Moderate Shelf-Life — 4-10 days)*: Cabbage, cauliflower, capsicum, okra.
  - *Tier 3 (Durable Storage — 15-90 days)*: Potatoes, dry onions, garlic, ash gourd.

</details>

<details>
<summary><b>5. Procurement Landed Cost Planner & Route Persistence</b></summary>
<br/>

- **Haversine Distance Matrix**: Vectorized computation of highway distances from all 40 APMCs to destination consumption hubs (*Ahmedabad, Surat, Vadodara, Rajkot, Anand*).
- **Landed Cost Breakdown**: Computes `Spot Auction Price + (Distance × Cartage Rate ₹/km/MT)`.
- **Database Persistence**: Click **"Save Sourcing Schedule"** to write active supply contracts directly into the backend database (`saved_schedules` table in SQLite/PostgreSQL) with instant CRUD capabilities.

</details>

<details>
<summary><b>6. Supply Risk & Microclimate Weather Correlation</b></summary>
<br/>

- **Supply Shock Z-Score**: Evaluates departure from 30-day rolling arrival baselines normalized by historical standard deviation.
- **Weather Impact Analysis**: Correlates 72-hour precipitation spikes (Open-Meteo API) with sudden arrival collapses and subsequent price surges.
- **Explainable Factors**: Generates transparent, human-readable risk drivers (*"Severe arrival drop of -48% combined with 42mm heavy rain over past 48h"*).

</details>

<details>
<summary><b>7. Pipeline Observability & Ingestion Telemetry</b></summary>
<br/>

- **Lakehouse Health Telemetry**: Live metrics for Bronze raw records, Silver clean records, quarantine rejection rates, and Gold feature datasets.
- **Duality Architecture**: Transparent failover detection between distributed Hadoop/PySpark and high-speed local DuckDB/SQLite engine.

</details>

<details>
<summary><b>8. Power BI / Analytics Export Center (Star Schema)</b></summary>
<br/>

- **Direct CSV/Parquet Ingestion**: Instant downloads of `Dim_Market.csv`, `Dim_Commodity.csv`, and `Fact_Market_Arrivals.csv`.
- **Kimball Dimensional Blueprint**: Pre-configured relationships with 1-to-Many cardinality and ready-to-paste enterprise DAX KPI formulas.

</details>

---

## 🏗️ Medallion Lakehouse Architecture

CropShock implements the industry-standard **Medallion Lakehouse pattern** (Bronze $\to$ Silver $\to$ Gold) ensuring data integrity, strict auditability, and sub-15ms query execution.

<div align="center">
  <img src="docs/screenshots/architecture_diagram.svg" alt="CropShock Architecture Diagram" width="100%" />
</div>

### Architectural Data Flow

```mermaid
flowchart LR
    subgraph Ingestion["1. Ingestion Layer"]
        A1["Agmarknet APMC Portals"] --> B1["Bronze Ingestion Service"]
        A2["Open-Meteo Weather API"] --> B1
        A3["Gujarat 33-District Master"] --> B1
    end

    subgraph Bronze["2. Bronze Layer (Raw Immutable)"]
        B1 --> BR1["Partitioned Parquet / JSON"]
        BR1 --> BR2["SHA-256 Batch Hashing"]
        BR2 --> BR3["Append-Only Audit Logs"]
    end

    subgraph Silver["3. Silver Layer (Clean & Conformed)"]
        BR1 --> S1["PySpark / DuckDB Engine"]
        S1 --> S2["Multi-Key Deduplication"]
        S2 --> S3["Schema Enforcement"]
        S2 --> SQ["Quarantine Outliers"]
        S3 --> SC["Silver Conformed Parquet"]
    end

    subgraph Gold["4. Gold Layer (Analytics Mart)"]
        SC --> G1["Rolling Baselines (w7, w30)"]
        G1 --> G2["Supply Shock Z-Scores"]
        G2 --> GS["Kimball Star Schema CSVs"]
        G2 --> GP["Gold Aggregates Parquet"]
    end

    subgraph Serving["5. Serving & Application Layer"]
        GP --> DB["SQLite / PostgreSQL Serving DB"]
        DB --> API["FastAPI REST Backend (JWT Auth)"]
        API --> UI["React 19 SPA Dashboard"]
        GS --> PBI["Power BI / Tableau Reporting"]
    end
```

### Layer Guarantees

| Layer | Storage Path | Format | Schema Enforcement | Purpose & Guarantees |
| :--- | :--- | :--- | :--- | :--- |
| **Bronze** | `data/lake/bronze/` | Raw JSON & Parquet | None (Schema-on-read) | Raw immutable source payloads, cryptographic SHA-256 audit hashes, 100% replayability. |
| **Silver** | `data/lake/silver/` | Snappy Parquet | Strict Pydantic / PySpark | Deduplicated on `(market_id, commodity_id, date)`. Null checks, type casting, bad-data quarantine. |
| **Gold** | `data/lake/gold/` | Parquet + CSV | Dimensional Kimball | Pre-computed 7d/30d moving averages, volatility standard deviations, supply shock scoring. |
| **Serving** | `data/serving.db` | Indexed SQLite / Postgres | B-Tree Relational | Sub-15ms query response times, full-text search, persistent user schedules and contracts. |

---

## 📊 Kimball Star Schema & Power BI Integration

For enterprise business intelligence teams, CropShock provides a certified **Kimball Dimensional Star Schema** that connects directly into Power BI, Tableau, or Excel.

```
       ┌────────────────────────┐             ┌─────────────────────────┐
       │       Dim_Market       │             │      Dim_Commodity      │
       ├────────────────────────┤             ├─────────────────────────┤
       │ PK  market_id          │             │ PK  commodity_id        │
       │     market_name        │             │     commodity_name      │
       │     district           │             │     local_name_gu       │
       │     zone               │             │     botanical_group     │
       │     latitude           │             │     perishability_tier  │
       │     longitude          │             │     shelf_life_days     │
       │     catchment_villages │             │     baseline_min_price  │
       └───────────┬────────────┘             └────────────┬────────────┘
                   │ 1                                     │ 1
                   │                                       │
                   │              ┌────────────────────────┐
                   └────────────> │  Fact_Market_Arrivals  │ <┘ *
                                * ├────────────────────────┤
                                  │ PK  fact_id            │
                                  │ FK  market_id          │
                                  │ FK  commodity_id       │
                                  │     observation_date   │
                                  │     arrival_quantity_mt│
                                  │     modal_price_qtl    │
                                  │     min_price_qtl      │
                                  │     max_price_qtl      │
                                  │     ma_7_modal_price   │
                                  │     supply_risk_score  │
                                  └────────────────────────┘
```

### Production DAX Measures Included in Export Center

```dax
// 1. Inter-Mandi Price Dispersion Spread
Inter_Mandi_Spread = 
MAX(Fact_Market_Arrivals[modal_price_qtl]) - MIN(Fact_Market_Arrivals[modal_price_qtl])

// 2. Percentage Price Divergence
Price_Divergence_Pct = 
DIVIDE([Inter_Mandi_Spread], MIN(Fact_Market_Arrivals[modal_price_qtl]), 0) * 100

// 3. Volatility Z-Score (Supply Shock Indicator)
Supply_Shock_ZScore = 
VAR CurrentArrival = SELECTEDVALUE(Fact_Market_Arrivals[arrival_quantity_mt])
VAR BaselineMean = SELECTEDVALUE(Fact_Market_Arrivals[ma_30_arrival_qty])
VAR BaselineStd = SELECTEDVALUE(Fact_Market_Arrivals[std_30_arrival_qty], 1)
RETURN
DIVIDE(CurrentArrival - BaselineMean, BaselineStd, 0)
```

---

## 👥 Stakeholder Personas & Role-Based Access Control (RBAC)

CropShock features built-in **Role-Based Access Control** with 4 dedicated industry personas. Switching roles dynamically reorganizes primary navigation tabs, metrics, and advisory callouts:

| Role | Stakeholder Persona | Organization | Primary Focus & Primary Views |
| :--- | :--- | :--- | :--- |
| **`PROCUREMENT_MANAGER`** | **Rajesh Patel** (B2B Sourcing Director) | *Gujarat AgriFoods & Processors* | Arbitrage minimization, Haversine landed cost optimization, scheduled contract persistence. |
| **`FPO_LEADER`** | **Vikrambhai Chaudhary** (FPO Chairman) | *Sabarkantha Vegetable Growers* | Collective farmer price realization, bypass middleman margins, dispatch timing. |
| **`APMC_OFFICIAL`** | **Dr. Hasmukh Shah** (Mandi Secretary) | *Gondal APMC Committee (Rajkot)* | Statutory market cess monitoring, arrival compliance under Gujarat APMC Act 1963. |
| **`DATA_ENGINEER`** | **Ananya Desai** (Platform Lead) | *CropShock AgData Team* | Lakehouse telemetry, bronze ingestion latency, PySpark partition tuning, schema evolution. |

### Demo Credentials (1-Click Login Available in Topbar)

| Email | Password | Role |
| :--- | :--- | :--- |
| `rajesh.patel@gujaratagrifoods.com` | `demo123` | B2B Procurement Director |
| `vikram.c@sabarkantha-fpo.org` | `demo123` | FPO Collective Chairman |
| `h.shah@gondal-apmc.gov.in` | `demo123` | APMC Mandi Secretary |
| `ananya.desai@cropshock.io` | `demo123` | Big Data Platform Lead |

---

## 🔌 REST API Documentation

The backend exposes a high-performance REST API with automated Swagger documentation available at **`http://localhost:8000/docs`**.

### Core Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Pipeline health, total registered markets, commodities, and lakehouse status | No |
| `GET` | `/api/v1/markets` | List all 40 APMCs (across all 33 districts) with latitude, longitude, zone, and catchment count | No |
| `GET` | `/api/v1/commodities` | List all 40 monitored vegetables with perishability tier and baseline prices | No |
| `GET` | `/api/v1/analytics/overview` | Statewide aggregated daily arrivals, weighted modal price, and top shocks | No |
| `GET` | `/api/v1/analytics/trends` | Historical prices, 7-day/30-day moving averages, and arrival volumes | No |
| `GET` | `/api/v1/analytics/compare` | Multi-mandi comparative spreads across selected APMC identifiers | No |
| `GET` | `/api/v1/analytics/supply-risk` | Supply shock risk scores with explainable meteorological/arrival factors | No |
| `POST` | `/api/v1/analytics/procurement-planner` | Haversine landed cost simulation with ranked candidate sourcing APMCs | No |
| `POST` | `/api/v1/auth/login` | Authenticate stakeholder email and issue signed HMAC-SHA256 JWT token | No |
| `GET` | `/api/v1/auth/me` | Decode and validate active JWT token session | Yes (`Bearer`) |
| `POST` | `/api/v1/schedules` | Commit and persist an active sourcing route contract into the database | Yes (`Bearer`) |
| `GET` | `/api/v1/schedules` | Retrieve all active persisted sourcing route contracts | Yes (`Bearer`) |
| `DELETE` | `/api/v1/schedules/{id}` | Remove or archive a saved sourcing route contract | Yes (`Bearer`) |
| `GET` | `/api/v1/export/powerbi` | Stream clean Kimball star schema CSV tables for Power BI / Excel | No |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+** (Verified on Python 3.11, 3.12, 3.13)
- **Node.js 18+** & **npm**
- *(Optional)* Docker Desktop (only required for full Hadoop/Spark cluster containerization)

### Option 1: One-Click Instant Launcher (Windows)

Simply double-click or run from PowerShell:
```powershell
.\run_local.bat
# or
.\run_local.ps1
```
This automatically verifies dependencies, seeds the local database, launches the FastAPI backend on port `8000`, and launches the Vite React frontend on port `5173`.

---

### Option 2: Step-by-Step Manual Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/cropshock-intelligence.git
cd cropshock-intelligence
```

#### 2. Configure Python Backend
```bash
# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 3. Configure React Frontend
```bash
# Open a new terminal tab
cd frontend
npm install
npm run dev
```

#### 4. Access the Dashboard
- **Web Dashboard**: Open [http://localhost:5173](http://localhost:5173) in your browser.
- **FastAPI Interactive Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs).

---

### Option 3: Full Docker Cluster Deployment

To run the distributed Hadoop HDFS, Apache Spark, and PostgreSQL stack:
```bash
docker-compose up --build
```
- **Hadoop NameNode UI**: `http://localhost:9870`
- **Spark Master UI**: `http://localhost:8080`
- **FastAPI Backend**: `http://localhost:8000`
- **Frontend Dashboard**: `http://localhost:5173`

---

## 🧪 Testing & Code Quality

CropShock adheres to rigorous automated testing across backend API endpoints and frontend compilation.

### Run Backend Integration Tests
```bash
python -m pytest -v backend/test_api.py
```
```text
======================== test session starts ========================
backend/test_api.py::test_health_check PASSED                  [ 11%]
backend/test_api.py::test_list_markets PASSED                  [ 22%]
backend/test_api.py::test_list_commodities PASSED              [ 33%]
backend/test_api.py::test_analytics_overview PASSED            [ 44%]
backend/test_api.py::test_analytics_trends PASSED              [ 55%]
backend/test_api.py::test_supply_risk_scores PASSED            [ 66%]
backend/test_api.py::test_compare_markets PASSED               [ 77%]
backend/test_api.py::test_procurement_planner PASSED           [ 88%]
backend/test_api.py::test_auth_and_schedules_lifecycle PASSED  [100%]
========================= 9 passed in 6.02s =========================
```

### Run Frontend TypeScript Compilation
```bash
cd frontend
npm run build
```
```text
> tsc -b && vite build
✓ 2044 modules transformed.
dist/index.html                   1.25 kB │ gzip:  0.73 kB
dist/assets/index-u1gW1Si3.css   10.08 kB │ gzip:  2.79 kB
dist/assets/index-Qqtx9rzY.js   349.18 kB │ gzip: 98.73 kB
✓ built in 1.10s
```

---

## 📂 Project Directory Structure

```text
CropShock/
├── .gitignore                      # Production Git ignore rules (caches, binaries, logs)
├── docker-compose.yml              # Distributed Docker cluster (Hadoop, Spark, Postgres)
├── requirements.txt                # Python dependencies (FastAPI, PyJWT, PySpark, DuckDB)
├── run_local.bat                   # 1-click Windows batch launcher
├── run_local.ps1                   # 1-click Windows PowerShell launcher
├── README.md                       # Comprehensive project documentation
│
├── airflow/
│   └── dags/                       # Automated daily ingestion DAGs
│
├── backend/
│   ├── database.py                 # SQLAlchemy relational schema & SQLite/Postgres fallback
│   ├── main.py                     # FastAPI REST API, JWT auth, and routing logic
│   ├── schemas.py                  # Pydantic v2 data transfer schemas
│   └── test_api.py                 # Pytest integration test suite (9 test cases)
│
├── data/
│   ├── catalogs/                   # Master catalogs (All 33 Districts, 40 Gujarat APMCs, 40 Vegetables)
│   ├── lake/
│   │   ├── bronze/                 # Raw immutable JSON/Parquet with SHA-256 hashes
│   │   ├── silver/                 # Conformed, deduplicated Snappy Parquet & audit logs
│   │   ├── silver_quarantine/      # Rejected bad records and outlier quarantine
│   │   └── gold/                   # Feature mart & Kimball Star Schema CSVs for Power BI
│   └── serving.db                  # High-speed indexed SQLite relational serving database
│
├── docs/
│   ├── PHASE1_SPECIFICATION.md     # Full architectural and domain specification
│   └── screenshots/                # High-definition SVG diagrams and UI previews
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── components/             # Reusable UI widgets (Map, Charts, Login, Profile Menu)
│   │   ├── context/                # AuthContext (JWT management & RBAC switching)
│   │   ├── types/                  # TypeScript interfaces & stakeholder profiles
│   │   ├── views/                  # 8 Specialized analytical command views
│   │   ├── api.ts                  # REST API client with JWT bearer interceptors
│   │   ├── App.tsx                 # Main application shell & tab routing
│   │   └── index.css               # Clean Inter typography & responsive glassmorphism
│
├── ingestion/
│   ├── bronze_writer.py            # Raw lake storage writer with hash verification
│   ├── open_meteo_client.py        # Microclimate weather client
│   └── seed_generator.py           # Historical APMC dataset generator
│
└── pipeline/
    ├── gold_transformer.py         # Rolling window aggregations & Star Schema builder
    ├── hdfs_manager.py             # WebHDFS and local filesystem abstraction
    ├── silver_transformer.py       # Deduplication, validation, and quarantine filter
    └── spark_medallion_job.py      # Dual-mode execution (Apache Spark / DuckDB)
```

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>Built with precision for Gujarat's Agricultural Supply Chain &amp; Big Data Engineering</b><br/>
  <sub>CropShock Intelligence Platform • 2026</sub>
</div>
