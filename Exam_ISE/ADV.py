from dotenv import load_dotenv
import streamlit as st
import pandas as pd
import google.generativeai as genai
import os
import re
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

def load_api_key():
    """Loads the API key from the .env file."""
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    return api_key

def extract_questions(text):
    question_pattern = r"^\*\s*(.*)\?"
    questions = re.findall(question_pattern, text, re.MULTILINE)
    return questions

def generate_questions(df):
    api_key = load_api_key()
    genai.configure(api_key=api_key)

    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    prompt = f"Analyze the following dataset: \n\n{df.head().to_markdown()}\n\nWhat are some insightful questions that can be answered using this data? Suggest top 3 questions. Also suggest the kind of visulaization best suites to answer that question !!"

    # Use the Gemini API to generate a response
    response = model.generate_content(prompt)

    text = response.candidates[0].content.parts[0].text
    questions = extract_questions(text)
    return questions

def generate_advanced_plot_code_gemini(query, df):
    data_structure = {col: str(dtype) for col, dtype in df.dtypes.items()}
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")

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

def main():
    st.title("Automated Data Visualization System")

    # File Uploader
    uploaded_file = st.file_uploader("Upload your CSV file", type=["csv"])

    if uploaded_file is not None:
        df = pd.read_csv(uploaded_file)
        st.dataframe(df.head())

        questions = generate_questions(df)
        st.header("Some questions for quick insight : ")

        for question in questions:
            st.markdown(f"- {question}")

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
                code = generate_advanced_plot_code_gemini(query, df)
                code = code.strip().splitlines()
                if len(code) > 2:
                    code = "\n".join(code[1:-1])

                # Execute the generated code
                with st.echo():
                    exec(code, {"df": df, "plt": plt, "sns": sns})

                # Display plot
                st.pyplot(plt.gcf())
                plt.figure()  # Create a new figure for the next plot

                # Clear the query input for the next query
                query = ""
                count = count+1
                query_completed = True


if __name__ == "__main__":
    main()
