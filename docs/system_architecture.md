# CropShock: End-to-End System Architecture & Technical Specification

> **Platform:** CropShock Enterprise Agricultural Market Intelligence & Supply Chain Lakehouse  
> **Geographic Scope:** All 33 Administrative Districts of Gujarat (40 APMC Mandis across 5 Agro-Climatic Zones)  
> **Commodity Scope:** Exhaustive Commercial Vegetable Master (40 Commercial Horticultural Crops)  
> **Target Audience:** Enterprise Data Architects, AgTech Analytics Leads, Supply Chain Directors  
> **Status:** Production-Ready Architectural Reference  

---

## 1. Executive System Overview

**CropShock** is a production-grade Big Data Lakehouse and spatial decision intelligence platform purpose-built for India's primary horticultural trade corridor—the state of **Gujarat**. 

Horticultural commodities suffer from extreme perishability (ambient shelf lives of 24–72 hours for leafy greens and vine vegetables), sharp price dispersion across regional wholesale yards (15% to 35% on any given morning), and climate vulnerability (unseasonal *Mavthu* rains, heatwaves, and frost). CropShock continuously captures spot auction records, micro-climate telemetry, and highway freight models to provide:

1. **Sub-15ms Serving Queries** for real-time market discovery and historical trends.
2. **Explainable Supply Shock Scoring** calibrated to commodity perishability tiers.
3. **Haversine Freight Optimization** identifying the lowest landed procurement cost across all active mandis.
4. **Persistent Contract Execution** directly synced to transactional databases.
5. **Certified Kimball Star Schema Datamarts** ready for direct Power BI, Tableau, and Excel ingestion.

```mermaid
flowchart TD
    subgraph Ingestion["1. Ingestion Layer"]
        AGM["Agmarknet & State APMC Direct APIs<br/>(40 Mandis, 40 Vegetables)"]
        MET["Open-Meteo High-Resolution Weather API<br/>(Hourly & Daily Grid Telemetry)"]
        CAT["Gujarat Master Catalog<br/>(All 33 Districts, GPS, Catchment Data)"]
    end

    subgraph Orchestration["2. Airflow Orchestration & Pipeline Engine"]
        DAG["cropshock_daily_pipeline_dag<br/>(18:00 IST Post-Auction Scheduled Trigger)"]
        GATE["Data Quality Gate (90% Pass-Rate SLA)"]
    end

    subgraph Medallion["3. Medallion Lakehouse (HDFS / Local Parquet)"]
        BRZ["Bronze Layer (Raw Immutable Parquet/JSON)<br/>Lineage: _ingested_at, _source_url, _batch_id, _raw_hash"]
        SLV["Silver Layer (Clean, Conformed & Deduplicated)<br/>Sanity Bounds, Dynamic Quarantining, Zero-Null Enforced"]
        GLD["Gold Layer (Analytical Marts & Feature Store)<br/>MA_7, MA_14, MA_30, Volatility StdDev, Supply Risk Scores"]
    end

    subgraph Serving["4. Serving & Relational Layer"]
        PG[("PostgreSQL 16 / Indexed SQLite Database<br/>Normalized 3NF Models, Composite B-Tree Indexes")]
        API["FastAPI High-Performance Async Backend<br/>Pydantic v2, JWT HS256 RBAC, Sub-15ms Query Response"]
    end

    subgraph Presentation["5. Presentation & Enterprise Intelligence"]
        UI["React 19 + TypeScript + Tailwind CSS Dashboard<br/>8 Specialized Command Views, Interactive Gujarat Vector Map"]
        BI["Power BI Star Schema Datamarts<br/>Dim_Market, Dim_Commodity, Fact_Market_Arrivals"]
    end

    Ingestion --> DAG
    DAG --> BRZ
    BRZ --> SLV
    SLV --> GATE
    GATE --> GLD
    GLD --> PG
    PG --> API
    API --> UI
    GLD -.-> BI
```

---

## 2. Domain Architecture: The Taluka APMC Catchment Model

A foundational architectural distinction in Indian AgTech data engineering is **why public market intelligence aggregates at the APMC Mandi (Taluka/District) level rather than the individual village level**.

```mermaid
flowchart LR
    subgraph Catchment["Rural Catchment Base (50-200 Villages)"]
        V1["Village Marginal Farmers"]
        V2["Village Commercial Growers"]
        V3["FPO Harvesting Clusters"]
    end

    subgraph APMC["Statutory Mandi Engine (Taluka / District Hub)"]
        YARD["APMC Principal Market Yard / Sub-Yard<br/>(Regulated under Gujarat APMC Act, 1963)"]
        SCALE["Statutory Electronic Weighbridges & Cess Collection"]
        AUC["Daily Open-Outcry & e-NAM Electronic Auction"]
        REC["Statutory Daily Price & Arrival Record<br/>(Min, Max, Modal Price in ₹/Qtl, Tonnage in MT)"]
    end

    subgraph Lakehouse["CropShock Lakehouse"]
        ING["Idempotent Daily Batch Ingestion"]
    end

    Catchment ==>|"15-40 km Daily Cartage"| YARD
    YARD --> SCALE
    SCALE --> AUC
    AUC --> REC
    REC ==>|"Daily Mandi Closing Broadcast"| ING
```

### Architectural & Economic Principles:
1. **Statutory Price Discovery**: Individual villages lack statutory weighing scales, regulated auction pits, and certified market reporting authorities. Under the **Gujarat Agricultural Produce Markets Act (1963)**, legally binding price discovery occurs exclusively at the APMC Market Yards and Sub-Market Yards (*મુખ્ય તથા ઉપ બજાર યાર્ડ*) situated at Taluka and District headquarters.
2. **The 15–40 km Economic Catchment Radius**: Each Taluka APMC yard serves as the natural economic funnel for 50 to 200+ surrounding agricultural villages. CropShock models spatial nodes at the APMC level, while maintaining catchment metadata (catchment village counts, elevation, agro-climatic zone) to evaluate localized supply vulnerability.

---

## 3. Geographic Scope: All 33 Districts of Gujarat

CropShock delivers comprehensive statewide coverage across **all 33 administrative districts of Gujarat**, organized into 5 Agro-Climatic Zones:

| Zone | Districts Covered | Primary APMC Wholesale Mandis | Agricultural Specializations |
| :--- | :--- | :--- | :--- |
| **Saurashtra** (11 Districts) | Rajkot, Bhavnagar, Junagadh, Jamnagar, Amreli, Surendranagar, Morbi, Porbandar, Botad, Gir Somnath, Devbhumi Dwarka | Gondal, Rajkot (Bedi), Mahuva, Bhavnagar, Junagadh, Jamnagar (Hapa), Amreli, Surendranagar, Morbi, Porbandar, Botad, Kodinar, Khambhalia | Garlic, Onion, Chilli, Cumin, Coriander, Groundnut |
| **Central Gujarat & Charotar** (7 Districts) | Ahmedabad, Anand, Kheda, Vadodara, Panchmahal, Dahod, Mahisagar, **Chhota Udaipur** | Ahmedabad (Jamalpur & Naroda), Anand, Nadiad, Vadodara (Sayajipura), Godhra, Dahod, Lunawada, **Bodeli (Chhota Udaipur)** | Tomato, Green Maize/Sweet Corn, Cabbage, Cauliflower, Brinjal, Okra |
| **North Gujarat** (6 Districts) | Banaskantha, Mehsana, Patan, Sabarkantha, Aravalli, Gandhinagar | Deesa, Palanpur, Mehsana, Unjha, Patan, Himatnagar, Modasa, Gandhinagar (Mansa) | Cold Storage Potato Hub (Deesa), Cluster Beans, Spices, Fennel |
| **South Gujarat** (7 Districts) | Surat, Navsari, Valsad, Bharuch, Narmada, Tapi, Dang | Surat (Sardar Market), Bardoli, Navsari, Valsad, Bharuch, Rajpipla, Vyara, Ahwa Sub-Yard | Tropical Gourds, Flat Beans (Papdi/Valore), Yam, Ginger, Colocasia |
| **Kutch** (1 District) | Kutch | Bhuj, Gandhidham | Semi-Arid Onion, Tomato, Carrot, Dates |

---

## 4. Commodity Taxonomy & Perishability Tiers (40 Crops)

The commodity catalog covers **all 40 commercial vegetable crops** cultivated and traded in Gujarat APMCs:

```
                          ┌────────────────────────┐
                          │   40 Vegetable Crops   │
                          └───────────┬────────────┘
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ Highly Perishable│         │Moderately Perish.│         │ Semi-Perishable  │
│  (1 - 4 Days)    │         │  (5 - 14 Days)   │         │ (15 - 120 Days)  │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ Tomato (TOM)     │         │ Brinjal (BRN)    │         │ Potato (POT)     │
│ Ladyfinger (OKR) │         │ Green Chilli(GCH)│         │ Onion (ONI)      │
│ Cauliflower(CAU) │         │ Cabbage (CAB)    │         │ Garlic (GAR)     │
│ Coriander (COR)  │         │ Bottle Gourd(BGD)│         │ Ginger (GNG)     │
│ Fenugreek (FEN)  │         │ Bitter Gourd(BTG)│         │ Sweet Potato(SWP)│
│ Spinach (SPN)    │         │ Ivy Gourd (IVG)  │         │ Yam / Suran(YAM) │
│ Mint (MNT)       │         │ Pointed Gourd(PTG│         │ Colocasia (COL)  │
│ Amaranth (AMR)   │         │ Drumstick (DRM)  │         │ Pumpkin (PUM)    │
│ Ridge Gourd(RGD) │         │ Cluster Beans(CLB│         │ Ash Gourd (ASH)  │
│ Sponge Gourd(SPG)│         │ Flat Beans (PAP) │         └──────────────────┘
│ Cucumber (CUC)   │         │ Carrot (CAR)     │
│ Green Peas (GPE) │         │ Radish (RAD)     │
│ French Beans(FRB)│         │ Beetroot (BET)   │
│ Cowpea/Chora(CWP)│         │ Lemon (LEM)      │
│ Capsicum (CAP)   │         │ Sweet Corn (SWC) │
└──────────────────┘         │ Knol Khol (KNK)  │
                             └──────────────────┘
```

---

## 5. Medallion Big Data Architecture & PySpark Transformations

CropShock implements the **Medallion Lakehouse Pattern** (Bronze $\to$ Silver $\to$ Gold) ensuring full auditability, cryptographic integrity, and sub-15ms query execution.

### 5.1. Bronze Layer (Raw & Immutable)
- **Path Pattern:** `data/lake/bronze/agmarknet/year=YYYY/month=MM/batch_{uuid}.parquet` (and matching `.json`).
- **Audit Columns Injected:**
  - `_batch_id`: UUIDv4 transaction identifier.
  - `_ingested_at`: UTC timestamp of arrival.
  - `_source_url`: Origin data portal identifier.
  - `_raw_hash`: SHA-256 cryptographic digest of the ingested payload batch.

### 5.2. Silver Layer (Cleaned & Standardized)
- **Composite Natural Key Deduplication:**
  ```python
  window_dedup = Window.partitionBy("market_id", "commodity_id", "observation_date") \
                       .orderBy(F.col("_ingested_at").desc())
  df_silver = df_bronze.withColumn("row_num", F.row_number().over(window_dedup)) \
                       .filter(F.col("row_num") == 1) \
                       .drop("row_num")
  ```
- **Data Quality & Sanity Bounds:**
  - Strict price positive constraints: $0 < P_{\text{min}} \le P_{\text{modal}} \le P_{\text{max}}$.
  - Maximum ceiling constraint: $P_{\text{max}} \le ₹30,000/\text{Qtl}$.
  - Non-negative arrival tonnage: $Q_{\text{arrival}} \ge 0\text{ MT}$.
  - Anomalous or corrupt records are routed to `data/lake/silver_quarantine/` with structured failure reasons.

### 5.3. Gold Layer (Analytical Datamarts & Feature Store)
- Computes partitioned rolling averages and volatility standard deviations:
  - 7-day moving averages (`ma_7_modal_price`, `ma_7_arrival_qty`).
  - 14-day moving averages (`ma_14_modal_price`, `ma_14_arrival_qty`).
  - 30-day moving averages (`ma_30_modal_price`).
  - 7-day price volatility standard deviation (`std_7_modal_price`).
- Evaluates arrival contraction percentage ($\Delta A$) and price surge percentage ($\Delta P$):
  $$\Delta A = \frac{Q_{\text{arrival}} - \text{MA}_7(Q)}{\text{MA}_7(Q)} \times 100$$
  $$\Delta P = \frac{P_{\text{modal}} - \text{MA}_7(P)}{\text{MA}_7(P)} \times 100$$

---

## 6. Multi-Commodity Explainable Supply-Risk Methodology

Supply shock risk scoring is mathematically calibrated to biological perishability tiers:

$$\text{SupplyRiskScore} = \left(w_A \times S_A\right) + \left(w_P \times S_P\right) + \left(w_W \times S_W\right)$$

### 6.1. Dimension Weights by Perishability Tier

| Perishability Tier | Arrival Weight ($w_A$) | Price Weight ($w_P$) | Weather Weight ($w_W$) | Economic Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Highly Perishable** | **0.50** | **0.30** | **0.20** | Immediate physical supply collapse directly triggers market stockouts. |
| **Moderately Perishable** | **0.45** | **0.35** | **0.20** | Balanced elasticity between yard arrivals and retail wholesale pricing. |
| **Semi-Perishable (Storable)** | **0.35** | **0.45** | **0.20** | Buffer cold storage dampens arrival drops; speculative surges dominate price. |

### 6.2. Meteorological Disturbance Sub-Score ($S_W$) Calibration
- **Unseasonal Rainfall Shock:** 3-day cumulative precipitation $> 50\text{ mm} \implies S_W = 85$.
- **Moderate Precipitation:** 3-day cumulative precipitation $> 20\text{ mm} \implies S_W = 55$.
- **Extreme Heatwave Shock:** Maximum temperature $T_{\text{max}} \ge 41^\circ\text{C} \implies S_W = 75$.
- **Baseline Weather Conditions:** $\implies S_W = 15$.

### 6.3. Composite Risk Tiers
- **LOW ($0 - 34.9$):** Normal seasonal trading volume and baseline price spreads.
- **MODERATE ($35.0 - 69.9$):** Noticeable arrival contraction; alerts FPOs and procurement planners.
- **HIGH ($70.0 - 100.0$):** Acute supply deficit and price spike; activates alternate sourcing corridors.

---

## 7. Spatial Logistics & Vectorized Haversine Procurement Optimization

To determine the lowest landed cost for food processors and bulk buyers, CropShock executes vectorized Haversine distance calculations from all 40 Gujarat APMCs to the specified destination consumption center:

$$d = 2 R \arcsin \left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cos(\phi_2) \sin^2\left(\frac{\Delta \lambda}{2}\right)}\right) \times \tau$$

Where:
- $R = 6,371\text{ km}$ (Earth radius).
- $\phi_1, \phi_2$ are latitudes in radians.
- $\Delta \lambda$ is longitude difference in radians.
- $\tau = 1.22$ is the **highway tortuosity factor** modeling actual road distance over geodesic distance across Gujarat highway networks (NH-48, NE-1, SH-17).

### Total Landed Cost Equation:
$$\text{LandedCost} = \left(P_{\text{modal}} \times 10\right) + \left(d \times R_{\text{freight}}\right)$$
$$\text{TotalOutlay} = \text{LandedCost} \times Q_{\text{target}}$$

Where $P_{\text{modal}}$ is in ₹/Quintal (converted to ₹/MT via factor 10), $d$ is highway distance in km, $R_{\text{freight}}$ is freight rate in ₹/km/MT (default: ₹4.50), and $Q_{\text{target}}$ is target volume in MT.

---

## 8. Relational Serving Schema (3NF)

```mermaid
erDiagram
    COMMODITIES ||--o{ MARKET_OBSERVATIONS : "tracks"
    MARKETS ||--o{ MARKET_OBSERVATIONS : "records"
    MARKETS ||--o{ WEATHER_OBSERVATIONS : "measures"
    MARKETS ||--o{ SUPPLY_RISK_RESULTS : "evaluates"
    COMMODITIES ||--o{ SUPPLY_RISK_RESULTS : "evaluates"
    SAVED_SCHEDULES }o--|| MARKETS : "sources"
    SAVED_SCHEDULES }o--|| COMMODITIES : "procures"

    MARKETS {
        int id PK
        string code UK
        string name
        string district
        string taluka
        string zone
        string state
        float latitude
        float longitude
        int elevation_m
        string market_tier
        int catchment_villages_approx
        boolean is_active
    }

    COMMODITIES {
        int id PK
        string code UK
        string name
        string local_name_gu
        string botanical_group
        string perishability_tier
        int ambient_shelf_life_days
        string standard_unit
        float baseline_min_price
        float baseline_max_price
    }

    MARKET_OBSERVATIONS {
        int id PK
        int market_id FK
        int commodity_id FK
        string observation_date
        float min_price
        float max_price
        float modal_price
        float price_spread
        float arrival_quantity
        string price_unit
        string arrival_unit
        string variety
        string data_source
        boolean is_synthetic
        string ingested_at
    }

    SUPPLY_RISK_RESULTS {
        int id PK
        int market_id FK
        int commodity_id FK
        string calculation_date
        float risk_score
        string risk_level
        float arrival_drop_pct
        float price_surge_pct
        float recent_rainfall_mm
        string explanation_factors
        string methodology_version
        string calculated_at
    }

    SAVED_SCHEDULES {
        int id PK
        string user_email
        string user_role
        int commodity_id FK
        string commodity_name
        int source_mandi_id FK
        string source_mandi_name
        string destination_district
        float quantity_mt
        float transport_rate_per_km_mt
        float modal_price_per_qtl
        float landed_cost_per_mt
        float total_outlay
        float arbitrage_savings
        string status
        string created_at
    }
```

---

## 9. Role-Based Access Control (RBAC) & Stakeholder Personas

CropShock enforces role-specific analytical views, action shortcuts, and advisory metrics across 4 industry personas:

| Persona | Stakeholder Name | Organization | Primary View & KPIs |
| :--- | :--- | :--- | :--- |
| **`PROCUREMENT_MANAGER`** | Rajesh Patel (B2B Sourcing Director) | *Gujarat AgriFoods & Processors* | Haversine landed cost optimization, supplier diversification, persistent contract scheduling. |
| **`FPO_LEADER`** | Vikrambhai Chaudhary (FPO Chairman) | *Sabarkantha Vegetable Growers FPO* | Collective farmer price realization, bypass middleman margins, dispatch timing vs Mandi price surges. |
| **`APMC_OFFICIAL`** | Dr. Hasmukh Shah (Mandi Secretary) | *Gondal APMC Committee (Rajkot)* | Statutory market cess monitoring (1.5% statutory rate), digital weighbridge compliance under Gujarat APMC Act 1963. |
| **`DATA_ENGINEER`** | Ananya Desai (Platform Lead) | *CropShock AgData Lakehouse Team* | Lakehouse health, Bronze ingestion latency, PySpark partition tuning, schema evolution, zero-quarantine telemetry. |

---

## 10. Kimball Star Schema & Enterprise Business Intelligence

For enterprise BI teams connecting Power BI, Tableau, or Excel, CropShock provides direct exports of certified dimensional tables:

```
        ┌─────────────────────────┐               ┌──────────────────────────┐
        │       Dim_Market        │               │      Dim_Commodity       │
        ├─────────────────────────┤               ├──────────────────────────┤
        │ PK  market_id           │               │ PK  commodity_id         │
        │     market_name         │               │     commodity_name       │
        │     district            │               │     local_name_gu        │
        │     zone                │               │     botanical_group      │
        │     latitude            │               │     perishability_tier   │
        │     longitude           │               │     shelf_life_days      │
        │     catchment_villages  │               │     baseline_min_price   │
        └────────────┬────────────┘               └─────────────┬────────────┘
                     │ 1                                        │ 1
                     │                                          │
                     │               ┌──────────────────────────┤
                     └─────────────> │   Fact_Market_Arrivals   │ <┘ *
                                   * ├──────────────────────────┤
                                     │ PK  fact_id              │
                                     │ FK  market_id            │
                                     │ FK  commodity_id         │
                                     │     observation_date     │
                                     │     arrival_quantity_mt  │
                                     │     modal_price_qtl      │
                                     │     min_price_qtl        │
                                     │     max_price_qtl        │
                                     │     ma_7_modal_price     │
                                     │     supply_risk_score    │
                                     └──────────────────────────┘
```

### Verified Enterprise DAX Formulas Included:
```dax
// 1. Inter-Mandi Price Spread
Inter_Mandi_Spread = 
MAX(Fact_Market_Arrivals[modal_price_qtl]) - MIN(Fact_Market_Arrivals[modal_price_qtl])

// 2. Percentage Price Divergence
Price_Divergence_Pct = 
DIVIDE([Inter_Mandi_Spread], MIN(Fact_Market_Arrivals[modal_price_qtl]), 0) * 100

// 3. Volatility Z-Score
Supply_Shock_ZScore = 
VAR CurrentArrival = SELECTEDVALUE(Fact_Market_Arrivals[arrival_quantity_mt])
VAR BaselineMean = SELECTEDVALUE(Fact_Market_Arrivals[ma_30_arrival_qty])
VAR BaselineStd = SELECTEDVALUE(Fact_Market_Arrivals[std_7_modal_price], 1)
RETURN
DIVIDE(CurrentArrival - BaselineMean, BaselineStd, 0)
```

---

## 11. Apache Airflow Orchestration DAG

The production DAG (`cropshock_daily_pipeline_dag`) is scheduled daily at **18:00 IST (12:30 UTC)** following statutory APMC closing declarations:

```mermaid
flowchart LR
    T1["task_ingest_bronze"] --> T3["task_silver_transform"]
    T2["task_ingest_weather"] --> T3
    T3 --> T4{"task_quality_gate<br/>(Pass Rate >= 90%)"}
    T4 -->|Pass| T5["task_gold_transform"]
    T5 --> T6["task_publish_postgres"]
    T6 --> T7["task_sync_hdfs"]
    T4 -.->|Breach| ALERT["Trigger PagerDuty / Ops Alert"]
```

### SLA & Quality Gate Parameters:
- **Max Ingestion Latency:** 30 minutes from mandi closing declarations.
- **Quality Gate Tolerance:** $> 90.0\%$ records must pass sanity bounds without quarantine routing.
- **Idempotency Guarantee:** Deduplication on `(market_id, commodity_id, observation_date)` guarantees zero duplicate rows upon DAG re-runs.

---

## 12. Verification & Testing Standards

CropShock maintains rigorous end-to-end automated testing:
- **Backend Test Suite:** 9/9 passing pytest integration tests covering system health, market filtering, commodity taxonomy, multi-mandi arbitrage spreads, Haversine procurement simulation, and JWT authentication lifecycle with database contract persistence.
- **Frontend Quality:** Full TypeScript strict checking (`tsc -b`) and Vite production bundle optimization with zero build warnings.
- **Dual Runtime Support:** Seamless fallback between full Docker distributed cluster (Hadoop HDFS, Spark, PostgreSQL) and high-speed local developer execution (DuckDB, Parquet, SQLite).

