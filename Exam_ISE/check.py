import streamlit as st
import pandas as pd
import numpy as np
import google.generativeai as genai
import matplotlib.pyplot as plt
import seaborn as sns
import os
import io

from dotenv import load_dotenv
load_dotenv()

# Configure the API key for Google Generative AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize the generative model
model = genai.GenerativeModel("gemini-1.5-flash")

def generate_advanced_plot_code_gemini(query, df):
    data_structure = {col: str(dtype) for col, dtype in df.dtypes.items()}
    # Prepare prompt for Gemini API
    prompt = (
        f"Generate Python code to create a plot for this query: '{query}'.\n"
        f"The DataFrame has the following columns and data types:\n{data_structure}.\n"
        "Use matplotlib, seaborn, or plotly for the plot and ensure the code is executable with necessary imports. "
        "Just give me pure code without any explanation or anything, so if I run it on Python it runs without alteration and i am executing it with with st.echo():  # Show generated code in the app exec(code, {'df': data, 'plt': plt, 'sns': sns})"
    )

    # Call Gemini's API
    response = model.generate_content(prompt)
    return response.text

def clean_data(df):
    # Handle missing values: Drop columns with > 50% missing data, otherwise fill with mean/mode
    df = df.dropna(thresh=len(df) * 0.5, axis=1)
    for col in df.select_dtypes(include=[np.number]).columns:
        df[col] = df[col].fillna(df[col].mean())
    for col in df.select_dtypes(include=[object]).columns:
        df[col] = df[col].fillna(df[col].mode()[0])
    return df

# Streamlit UI components
st.title("ADV Project of Advanced Plot Generation")
st.write("Upload a CSV file, enter a plot query, and generate a plot based on your data and query.")

# File uploader
uploaded_file = st.file_uploader("Upload a CSV file", type="csv")
if uploaded_file:
    data = pd.read_csv(uploaded_file)
    data = clean_data(data)
    st.write("Dataset Loaded and Cleaned Successfully!")
    st.write(data.head())  # Display first few rows of the dataframe

# Query input
plot_container = st.container()
query_completed = True
count = 1

with plot_container:
  while query_completed:
    query_completed = False
    query = st.text_input("Enter your query for the plot", key=f"query-{count}")
    if query:
      # Generate and execute plot code
      code = generate_advanced_plot_code_gemini(query, data)
      code = code.strip().splitlines()
      if len(code) > 2:
        code = "\n".join(code[1:-1])

      # Execute the generated code
      with st.echo():
        exec(code, {"df": data, "plt": plt, "sns": sns})

      # Display plot
      st.pyplot(plt.gcf())
      plt.figure()  # Create a new figure for the next plot

      # Clear the query input for the next query
      query = ""
      count = count+1
      query_completed = True



