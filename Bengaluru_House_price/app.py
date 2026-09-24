import streamlit as st
import pandas as pd
import joblib


# -----------------------------
# PAGE CONFIG
# -----------------------------

st.set_page_config(
    page_title="Bengaluru House Price Prediction",
    page_icon="🏠",
    layout="wide"
)


# -----------------------------
# LOAD MODEL
# -----------------------------

model = joblib.load("house_price_model.pkl")
scaler = joblib.load("scaler.pkl")
model_columns = joblib.load("model_columns.pkl")


# -----------------------------
# TITLE
# -----------------------------

st.title("🏠 Bengaluru House Price Prediction")

st.write(
    "Enter the house details below to estimate its price."
)

st.divider()


# -----------------------------
# INPUT OPTIONS
# -----------------------------

area_types = [
    "Carpet Area",
    "Plot Area",
    "Super built-up Area",
    "Built-up Area"
]

availability_options = [
    "Ready",
    "Not Ready"
]

locations = [
    "Bannerghatta Road",
    "Bellandur",
    "Electronic City",
    "Electronic City Phase II",
    "Electronics City Phase 1",
    "Haralur Road",
    "Hebbal",
    "Hennur Road",
    "Hoodi",
    "KR Puram",
    "Kanakpura Road",
    "Marathahalli",
    "Other",
    "Raja Rajeshwari Nagar",
    "Rajaji Nagar",
    "Sarjapur Road",
    "Thanisandra",
    "Uttarahalli",
    "Whitefield",
    "Yelahanka"
]


# -----------------------------
# USER INPUT
# -----------------------------

col1, col2 = st.columns(2)


with col1:

    total_sqft = st.number_input(
        "Total Area (sqft)",
        min_value=100.0,
        max_value=50000.0,
        value=1200.0,
        step=50.0
    )

    bhk = st.number_input(
        "BHK",
        min_value=1,
        max_value=10,
        value=2,
        step=1
    )

    bath = st.number_input(
        "Bathrooms",
        min_value=1.0,
        max_value=10.0,
        value=2.0,
        step=1.0
    )

    balcony = st.number_input(
        "Balcony",
        min_value=0.0,
        max_value=5.0,
        value=1.0,
        step=1.0
    )


with col2:

    area_type = st.selectbox(
        "Area Type",
        area_types
    )

    availability = st.selectbox(
        "Availability",
        availability_options
    )

    location = st.selectbox(
        "Location",
        locations
    )


st.divider()


# -----------------------------
# PREDICTION
# -----------------------------

if st.button(
    "🔮 Predict House Price",
    use_container_width=True
):

    # Create empty dataframe
    input_data = pd.DataFrame(
        0,
        index=[0],
        columns=model_columns
    )

    # Numeric values
    input_data["total_sqft"] = total_sqft
    input_data["bath"] = bath
    input_data["balcony"] = balcony
    input_data["bhk"] = bhk

    # Area type
    area_column = "area_type_" + area_type

    if area_column in input_data.columns:
        input_data[area_column] = 1

    # Availability
    if availability == "Ready":

        if "availability_Ready" in input_data.columns:
            input_data["availability_Ready"] = 1

    # Location
    location_column = "location_" + location

    if location_column in input_data.columns:
        input_data[location_column] = 1

    # Remove target if accidentally present
    if "price" in input_data.columns:
        input_data = input_data.drop(columns=["price"])

    # Scale input
    input_scaled = scaler.transform(input_data)

    # Prediction
    prediction = model.predict(input_scaled)

    # Display result
    st.success(
        f"🏠 Estimated House Price: ₹{prediction[0]:.2f} Lakhs"
    )
    # python -m streamlit run app.py