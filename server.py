import os
import math
import warnings
import pandas as pd
import numpy as np
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "Bengaluru_House_price")

# Load model artifacts
try:
    cols = joblib.load(os.path.join(MODEL_DIR, "model_columns.pkl"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    model_lr = joblib.load(os.path.join(MODEL_DIR, "house_price_model.pkl"))
except Exception as e:
    print(f"Error loading Linear Regression model: {e}")
    cols = []
    scaler = None
    model_lr = None

try:
    model_rf = joblib.load(os.path.join(BASE_DIR, "best_model_tuned.pkl"))
except Exception as e:
    print(f"Error loading Random Forest model: {e}")
    model_rf = None

# Load dataset files
raw_csv_path = os.path.join(BASE_DIR, "Bengaluru_House_Data.csv")
clean_csv_path = os.path.join(BASE_DIR, "Cleaned_Bengaluru_House_Data.csv")

try:
    df_raw = pd.read_csv(raw_csv_path)
except Exception as e:
    print(f"Error loading raw CSV: {e}")
    df_raw = pd.DataFrame()

try:
    df_clean = pd.read_csv(clean_csv_path)
except Exception as e:
    print(f"Error loading clean CSV: {e}")
    df_clean = pd.DataFrame()

# Clean raw dataframe for display
if not df_raw.empty:
    df_raw_display = df_raw.copy()
    df_raw_display['total_sqft_clean'] = pd.to_numeric(df_raw_display['total_sqft'], errors='coerce')
    df_raw_display['price_per_sqft'] = np.where(
        df_raw_display['total_sqft_clean'] > 0,
        (df_raw_display['price'] * 100000) / df_raw_display['total_sqft_clean'],
        np.nan
    )
else:
    df_raw_display = pd.DataFrame()

LOCATIONS_LIST = [
    "Bannerghatta Road", "Bellandur", "Electronic City", "Electronic City Phase II",
    "Electronics City Phase 1", "Haralur Road", "Hebbal", "Hennur Road", "Hoodi",
    "KR Puram", "Kanakpura Road", "Marathahalli", "Other", "Raja Rajeshwari Nagar",
    "Rajaji Nagar", "Sarjapur  Road", "Thanisandra", "Uttarahalli", "Whitefield", "Yelahanka"
]

AREA_TYPES_LIST = [
    "Super built-up  Area", "Built-up  Area", "Plot  Area", "Carpet  Area"
]

COLUMN_METADATA = [
    {
        "name": "area_type",
        "type": "Categorical (String)",
        "category": "Raw Feature",
        "description": "Category of total area (Super built-up Area, Built-up Area, Plot Area, Carpet Area).",
        "null_count": int(df_raw['area_type'].isnull().sum()) if not df_raw.empty else 0,
        "unique_count": int(df_raw['area_type'].nunique()) if not df_raw.empty else 4,
        "samples": ["Super built-up  Area", "Plot  Area", "Built-up  Area"],
        "encoding": "One-Hot Encoded into area_type_Carpet Area, area_type_Plot Area, area_type_Super built-up Area"
    },
    {
        "name": "availability",
        "type": "Categorical (String)",
        "category": "Raw Feature",
        "description": "Status of property availability e.g. 'Ready To Move', or completion date string.",
        "null_count": int(df_raw['availability'].isnull().sum()) if not df_raw.empty else 0,
        "unique_count": int(df_raw['availability'].nunique()) if not df_raw.empty else 81,
        "samples": ["Ready To Move", "19-Dec", "18-May"],
        "encoding": "Binary Encoded into availability_Ready (1 if Ready To Move, else 0)"
    },
    {
        "name": "location",
        "type": "Categorical (String)",
        "category": "Raw Feature",
        "description": "Locality/neighborhood in Bengaluru where the property is situated.",
        "null_count": int(df_raw['location'].isnull().sum()) if not df_raw.empty else 1,
        "unique_count": int(df_raw['location'].nunique()) if not df_raw.empty else 1305,
        "samples": ["Electronic City Phase II", "Chikka Tirupathi", "Whitefield"],
        "encoding": "One-Hot Encoded into 20 top location columns (locations with <10 properties grouped into 'Other')"
    },
    {
        "name": "size",
        "type": "Categorical (String)",
        "category": "Raw Feature",
        "description": "Raw room configuration string e.g. '2 BHK', '4 Bedroom', '3 BHK'.",
        "null_count": int(df_raw['size'].isnull().sum()) if not df_raw.empty else 16,
        "unique_count": int(df_raw['size'].nunique()) if not df_raw.empty else 31,
        "samples": ["2 BHK", "4 Bedroom", "3 BHK"],
        "encoding": "Parsed into numerical feature 'bhk' (number of bedrooms)"
    },
    {
        "name": "society",
        "type": "Categorical (String)",
        "category": "Raw Feature",
        "description": "Name of the residential society or builder project name.",
        "null_count": int(df_raw['society'].isnull().sum()) if not df_raw.empty else 5502,
        "unique_count": int(df_raw['society'].nunique()) if not df_raw.empty else 2688,
        "samples": ["Coena Purva", "Theyt ", "Sohype "],
        "encoding": "Excluded from model due to high missing values (>40%)"
    },
    {
        "name": "total_sqft",
        "type": "Numerical / Text",
        "category": "Raw Feature",
        "description": "Total floor area of the property in square feet.",
        "null_count": int(df_raw['total_sqft'].isnull().sum()) if not df_raw.empty else 0,
        "unique_count": int(df_raw['total_sqft'].nunique()) if not df_raw.empty else 2117,
        "samples": ["1056", "2600", "1100"],
        "encoding": "Converted to float average of range values. Range: 300 - 52,272 sqft."
    },
    {
        "name": "bath",
        "type": "Numerical (Float)",
        "category": "Raw Feature",
        "description": "Number of bathrooms in the property.",
        "null_count": int(df_raw['bath'].isnull().sum()) if not df_raw.empty else 73,
        "unique_count": int(df_raw['bath'].nunique()) if not df_raw.empty else 19,
        "samples": [2.0, 3.0, 5.0],
        "encoding": "Used directly as numerical feature. Cleaned to remove extreme outliers (bath > bhk + 2)."
    },
    {
        "name": "balcony",
        "type": "Numerical (Float)",
        "category": "Raw Feature",
        "description": "Number of balconies attached to the property.",
        "null_count": int(df_raw['balcony'].isnull().sum()) if not df_raw.empty else 609,
        "unique_count": int(df_raw['balcony'].nunique()) if not df_raw.empty else 4,
        "samples": [0.0, 1.0, 2.0, 3.0],
        "encoding": "Imputed missing values with median balcony count (1.0)."
    },
    {
        "name": "price",
        "type": "Numerical (Float) - TARGET",
        "category": "Target Variable",
        "description": "Final property selling price in Lakhs Indian Rupees (1 Lakh = ₹100,000).",
        "null_count": int(df_raw['price'].isnull().sum()) if not df_raw.empty else 0,
        "unique_count": int(df_raw['price'].nunique()) if not df_raw.empty else 1994,
        "samples": [39.07, 120.0, 62.0],
        "encoding": "Target variable Y for supervised learning algorithms."
    },
    {
        "name": "bhk",
        "type": "Numerical (Integer)",
        "category": "Engineered Feature",
        "description": "Extracted integer value representing Bedroom, Hall, Kitchen count from 'size'.",
        "null_count": 0,
        "unique_count": 10,
        "samples": [1, 2, 3, 4, 5],
        "encoding": "Numerical input feature. Min: 1, Max: 10."
    },
    {
        "name": "sqft_per_bhk",
        "type": "Numerical (Float)",
        "category": "Engineered Feature",
        "description": "Ratio of total floor area divided by BHK count (total_sqft / bhk).",
        "null_count": 0,
        "unique_count": 1500,
        "samples": [528.0, 600.0, 750.0],
        "encoding": "Engineered feature used in Random Forest model to measure spaciousness per room."
    }
]

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "models": {
            "linear_regression": model_lr is not None,
            "random_forest": model_rf is not None
        },
        "raw_dataset_rows": len(df_raw),
        "clean_dataset_rows": len(df_clean)
    })

@app.route('/api/columns', methods=['GET'])
def get_columns():
    encoded_cols_info = []
    for c in cols:
        category = "Numerical Model Feature" if c in ['total_sqft', 'bath', 'balcony', 'bhk'] else "One-Hot Encoded Feature"
        encoded_cols_info.append({
            "name": c,
            "category": category,
            "type": "Float (0.0 or 1.0)" if "One-Hot" in category else "Float",
            "description": f"Model binary feature indicator for {c}" if "One-Hot" in category else f"Numerical feature {c}"
        })

    return jsonify({
        "raw_columns": COLUMN_METADATA,
        "model_columns": encoded_cols_info,
        "total_raw_columns": len(COLUMN_METADATA),
        "total_model_columns": len(cols)
    })

@app.route('/api/models/comparison', methods=['GET'])
def get_model_comparison():
    comp_path = os.path.join(BASE_DIR, "model_comparison.csv")
    models_data = []
    if os.path.exists(comp_path):
        try:
            comp_df = pd.read_csv(comp_path)
            for _, r in comp_df.iterrows():
                m_name = str(r['Model'])
                models_data.append({
                    "model": m_name,
                    "is_best_model": "Random Forest" in m_name,
                    "train_rss": round(float(r['Train_RSS']), 2),
                    "train_rmse": round(float(r['Train_RMSE']), 2),
                    "train_mae": round(float(r['Train_MAE']), 2),
                    "train_r2": round(float(r['Train_R2']), 4),
                    "test_rss": round(float(r['Test_RSS']), 2),
                    "test_rmse": round(float(r['Test_RMSE']), 2),
                    "test_mae": round(float(r['Test_MAE']), 2),
                    "test_r2": round(float(r['Test_R2']), 4),
                    "fit_status": str(r['Fit_Status']),
                    "cv_r2_mean": round(float(r['CV_R2_mean']), 4),
                    "cv_r2_std": round(float(r['CV_R2_std']), 4)
                })
        except Exception as e:
            print(f"Error reading model_comparison.csv: {e}")

    return jsonify({
        "models": models_data,
        "best_model": "Random Forest (Bagging)",
        "best_model_file": "best_model_tuned.pkl",
        "best_model_cv_r2": 0.791,
        "best_model_test_rmse": 10.99
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}

    try:
        sqft = float(data.get('total_sqft', 1200))
        bhk = int(data.get('bhk', 2))
        bath = float(data.get('bath', 2))
        balcony = float(data.get('balcony', 1))
        area_type = str(data.get('area_type', 'Super built-up  Area'))
        availability = str(data.get('availability', 'Ready'))
        location = str(data.get('location', 'Whitefield'))
        model_type = str(data.get('model_type', 'rf')).lower()

        # Build feature DataFrame with model_columns
        input_df = pd.DataFrame(0, index=[0], columns=cols)
        input_df['total_sqft'] = sqft
        input_df['bhk'] = bhk
        input_df['bath'] = bath
        input_df['balcony'] = balcony

        clean_area = area_type.strip()
        if clean_area in ["Super built-up Area", "Super built-up  Area"]:
            area_col = "area_type_Super built-up  Area"
        elif clean_area in ["Plot Area", "Plot  Area"]:
            area_col = "area_type_Plot  Area"
        elif clean_area in ["Carpet Area", "Carpet  Area"]:
            area_col = "area_type_Carpet  Area"
        else:
            area_col = None

        if area_col and area_col in input_df.columns:
            input_df[area_col] = 1

        if availability in ["Ready", "Ready To Move"]:
            if "availability_Ready" in input_df.columns:
                input_df["availability_Ready"] = 1

        loc_col = "location_" + location.strip()
        if loc_col == "location_Sarjapur Road":
            loc_col = "location_Sarjapur  Road"

        if loc_col in input_df.columns:
            input_df[loc_col] = 1
        else:
            if "location_Other" in input_df.columns:
                input_df["location_Other"] = 1

        # Compute prediction using Random Forest model (best_model_tuned.pkl)
        if model_rf is not None:
            rf_df = input_df.copy()
            rf_df['sqft_per_bhk'] = rf_df['total_sqft'] / rf_df['bhk']
            pred_lakhs = float(model_rf.predict(rf_df)[0])
            pred_lakhs = max(1.0, round(pred_lakhs, 2))
        else:
            # Fallback estimation if model artifact is loading
            if scaler is not None and model_lr is not None:
                scaled_arr = scaler.transform(input_df)
                pred_lakhs = max(1.0, round(float(model_lr.predict(scaled_arr)[0]), 2))
            else:
                pred_lakhs = 50.0

        price_rupees = round(pred_lakhs * 100000)
        price_per_sqft = round(price_rupees / sqft) if sqft > 0 else 0

        if pred_lakhs >= 100:
            crores_val = round(pred_lakhs / 100, 2)
            formatted_price = f"₹{crores_val} Cr (₹{pred_lakhs:.2f} Lakhs)"
        else:
            formatted_price = f"₹{pred_lakhs:.2f} Lakhs"

        if pred_lakhs < 50:
            tier = "Budget Friendly"
        elif pred_lakhs < 120:
            tier = "Mid-Segment"
        elif pred_lakhs < 250:
            tier = "Premium Luxury"
        else:
            tier = "Ultra Luxury / Villa"

        comparables = []
        if not df_raw.empty:
            loc_filter = location.strip()
            sub_df = df_raw_display[
                (df_raw_display['location'].str.contains(loc_filter, case=False, na=False)) |
                (df_raw_display['total_sqft_clean'].between(sqft * 0.8, sqft * 1.2))
            ].copy()

            if sub_df.empty:
                sub_df = df_raw_display.head(50)

            sub_df['sqft_diff'] = (sub_df['total_sqft_clean'] - sqft).abs()
            top_comps = sub_df.sort_values(by=['sqft_diff']).head(4)

            for idx, row in top_comps.iterrows():
                comparables.append({
                    "location": str(row.get('location', 'N/A')),
                    "size": str(row.get('size', 'N/A')),
                    "total_sqft": str(row.get('total_sqft', 'N/A')),
                    "price_lakhs": float(row.get('price', 0)),
                    "price_per_sqft": round(float(row.get('price_per_sqft', 0))) if pd.notnull(row.get('price_per_sqft')) else 0,
                    "area_type": str(row.get('area_type', 'N/A'))
                })

        return jsonify({
            "status": "success",
            "prediction": {
                "price_lakhs": pred_lakhs,
                "price_rupees": price_rupees,
                "price_per_sqft": price_per_sqft,
                "formatted_price": formatted_price,
                "price_tier": tier
            },
            "input_params": {
                "total_sqft": sqft,
                "bhk": bhk,
                "bath": bath,
                "balcony": balcony,
                "area_type": area_type,
                "availability": availability,
                "location": location
            },
            "comparables": comparables
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/locations', methods=['GET'])
def get_locations():
    location_stats = []
    if not df_raw_display.empty:
        counts = df_raw_display['location'].value_counts()
        for loc in LOCATIONS_LIST:
            clean_loc = loc.replace("  ", " ")
            matching_count = int(counts.filter(like=clean_loc).sum()) if clean_loc in counts else 50
            location_stats.append({
                "name": loc,
                "display_name": clean_loc,
                "count": matching_count
            })
    else:
        for loc in LOCATIONS_LIST:
            location_stats.append({"name": loc, "display_name": loc.replace("  ", " "), "count": 100})

    return jsonify({"locations": location_stats})

@app.route('/api/dataset', methods=['GET'])
def get_dataset():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 15))
    search = request.args.get('search', '').strip().lower()
    bhk_filter = request.args.get('bhk', '')
    location_filter = request.args.get('location', '')
    sort_by = request.args.get('sort_by', '')
    sort_order = request.args.get('sort_order', 'asc')

    if df_raw.empty:
        return jsonify({"data": [], "total": 0, "page": page, "pages": 0})

    filtered_df = df_raw_display.copy()

    if search:
        filtered_df = filtered_df[
            filtered_df['location'].astype(str).str.lower().str.contains(search, na=False) |
            filtered_df['society'].astype(str).str.lower().str.contains(search, na=False) |
            filtered_df['area_type'].astype(str).str.lower().str.contains(search, na=False)
        ]

    if location_filter:
        filtered_df = filtered_df[filtered_df['location'].astype(str).str.contains(location_filter, case=False, na=False)]

    if bhk_filter and bhk_filter.isdigit():
        filtered_df = filtered_df[filtered_df['size'].astype(str).str.contains(f"{bhk_filter} BHK|{bhk_filter} Bedroom", case=False, na=False)]

    if sort_by in ['price', 'bath', 'balcony', 'total_sqft_clean', 'price_per_sqft']:
        ascending = (sort_order.lower() == 'asc')
        filtered_df = filtered_df.sort_values(by=sort_by, ascending=ascending)

    total_records = len(filtered_df)
    total_pages = math.ceil(total_records / limit) if limit > 0 else 1

    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_records = filtered_df.iloc[start_idx:end_idx]

    records = []
    for _, r in page_records.iterrows():
        records.append({
            "area_type": str(r.get('area_type', '')),
            "availability": str(r.get('availability', '')),
            "location": str(r.get('location', '')),
            "size": str(r.get('size', '')),
            "society": str(r.get('society', 'N/A')) if pd.notnull(r.get('society')) else 'N/A',
            "total_sqft": str(r.get('total_sqft', '')),
            "bath": float(r.get('bath', 0)) if pd.notnull(r.get('bath')) else None,
            "balcony": float(r.get('balcony', 0)) if pd.notnull(r.get('balcony')) else None,
            "price": float(r.get('price', 0)),
            "price_per_sqft": round(float(r.get('price_per_sqft', 0))) if pd.notnull(r.get('price_per_sqft')) else None
        })

    return jsonify({
        "data": records,
        "total": total_records,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    })

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    if df_raw_display.empty:
        return jsonify({})

    loc_group = df_raw_display.groupby('location').agg(
        count=('price', 'count'),
        avg_price=('price', 'mean'),
        avg_sqft=('total_sqft_clean', 'mean')
    ).reset_index()

    loc_group = loc_group[loc_group['count'] >= 15].sort_values(by='count', ascending=False).head(15)
    loc_stats = []
    for _, r in loc_group.iterrows():
        avg_sqft = r['avg_sqft'] if pd.notnull(r['avg_sqft']) and r['avg_sqft'] > 0 else 1200
        avg_price = r['avg_price']
        price_sqft = round((avg_price * 100000) / avg_sqft)
        loc_stats.append({
            "location": str(r['location']),
            "count": int(r['count']),
            "avg_price_lakhs": round(float(avg_price), 2),
            "avg_sqft": round(float(avg_sqft)),
            "avg_price_per_sqft": price_sqft
        })

    area_group = df_raw_display.groupby('area_type').agg(
        count=('price', 'count'),
        avg_price=('price', 'mean')
    ).reset_index()

    area_stats = []
    for _, r in area_group.iterrows():
        area_stats.append({
            "area_type": str(r['area_type']),
            "count": int(r['count']),
            "avg_price": round(float(r['avg_price']), 2)
        })

    bhk_data = df_clean.groupby('bhk').agg(
        count=('price', 'count'),
        avg_price=('price', 'mean')
    ).reset_index()

    bhk_stats = []
    for _, r in bhk_data.iterrows():
        if r['bhk'] <= 6:
            bhk_stats.append({
                "bhk": f"{int(r['bhk'])} BHK",
                "count": int(r['count']),
                "avg_price": round(float(r['avg_price']), 2)
            })

    sample_df = df_raw_display.dropna(subset=['total_sqft_clean', 'price']).copy()
    sample_df = sample_df[(sample_df['total_sqft_clean'] <= 5000) & (sample_df['price'] <= 500)]
    sample_df = sample_df.sample(n=min(250, len(sample_df)), random_state=42)

    scatter_data = []
    for _, r in sample_df.iterrows():
        scatter_data.append({
            "sqft": float(r['total_sqft_clean']),
            "price": float(r['price']),
            "location": str(r.get('location', 'Other')),
            "size": str(r.get('size', ''))
        })

    return jsonify({
        "location_averages": loc_stats,
        "area_type_distribution": area_stats,
        "bhk_distribution": bhk_stats,
        "sqft_vs_price_scatter": scatter_data
    })

if __name__ == '__main__':
    print("Starting Bengaluru House Price API Server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
