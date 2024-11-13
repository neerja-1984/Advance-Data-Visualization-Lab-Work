import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Title
st.title("My First Streamlit App")
st.write("This is a simple app to demonstrate Streamlit's capabilities.")

# input
name = st.text_input("Enter your name")
age = st.number_input("Enter your age")

st.write(f"my name is {name} and my age is {age}")

# Data
df = pd.DataFrame(
    np.random.randn(10, 5),
    columns=('col %d' % i for i in range(5)))

# Display Data
st.dataframe(df)

# Add a slider
slider_val = st.slider('Select a range', 0, 100, 20)
st.write('Selected value:', slider_val)

# plots
x = [1, 2, 3]
y = [2, 4, 1]
plt.plot(x, y)
st.pyplot(plt)

# dynamic runnign of code 

# Sample DataFrame
st.write("dynamic plot genration")
df = pd.DataFrame({'A': [1, 2, 3, 4, 5], 'B': [2, 4, 5, 4, 5], 'C': [3, 1, 4, 1, 5]})

# Select a column for visualization
selected_column = st.selectbox("Select a column", df.columns)

def generate_plot():
  with st.echo():
    plt.figure(figsize=(8, 4))
    plt.hist(df[selected_column], bins=20)
    plt.xlabel(selected_column)
    plt.ylabel("Frequency")
    plt.title(f"Histogram of {selected_column}")
    st.pyplot(plt)
  # Use st.pyplot to display the plot

# Button to trigger plot generation
if st.button("Generate Histogram"):
  generate_plot()