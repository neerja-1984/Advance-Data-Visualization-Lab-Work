import streamlit as st
import matplotlib.pyplot as plt
import pandas as pd
import plotly.express as px
import seaborn as sns
import numpy as np
from wordcloud import WordCloud

# for non-linear regression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline

# Function to display a plot using Streamlit
def display_plot(fig):
  st.pyplot(fig)

def main():
  st.title('Life Expectancy Data Analysis')

  df = pd.read_csv("Life Expectancy Data.csv")  # Replace with your sample data path

  # Correlation Matrix
  st.subheader('Correlation Matrix')
  numeric_df = df.select_dtypes(include=['float', 'int'])
  corr_matrix = numeric_df.corr()
  fig, ax = plt.subplots(figsize=(10, 8))
  sns.heatmap(corr_matrix, annot=True, fmt=".1f", ax=ax)
  plt.title('Correlation Matrix')
  display_plot(fig)

  # Wordcloud
  st.subheader('Wordcloud')
  text = ' '.join(df['Status'].astype(str).tolist() +
                  df['Year'].astype(str).tolist() +
                  df['Country'].tolist() +
                  df['Life expectancy '].astype(str).tolist())
  wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
  fig, ax = plt.subplots(figsize=(10, 5))
  ax.imshow(wordcloud, interpolation='bilinear')
  ax.axis('off')
  display_plot(fig)

  # Life Expectancy per Year
  st.subheader('Life Expectancy per Year')
  fig, ax = plt.subplots(figsize=(10, 5))
  sns.boxplot(x='Year', y='Life expectancy ', data=df, ax=ax)
  plt.xticks(rotation=90)
  plt.title('Life Expectancy per Year')
  plt.ylabel('Life Expectancy')
  plt.xlabel('Year')
  display_plot(fig)

  # Life Expectancy Distribution per Year
  st.subheader('Life Expectancy Distribution per Year')
  fig, ax = plt.subplots(figsize=(10, 5))
  sns.violinplot(x='Year', y='Life expectancy ', data=df, ax=ax)
  plt.xticks(rotation=90)
  plt.title('Life Expectancy Distribution per Year')
  plt.ylabel('Life Expectancy')
  plt.xlabel('Year')
  display_plot(fig)

  # Life Expectancy Over Years (Animated by Country)
  st.subheader('Life Expectancy Over Years')
  fig = px.line(df.sort_values(by='Year'), x='Year', y='Life expectancy ',
                animation_frame='Country', animation_group='Year', color='Country',
                markers=True, title='Country wise Life Expectancy over Years')
  fig.update_yaxes(range=[0, 100])
  st.plotly_chart(fig)

  # Non-Linear Regression
  st.subheader('Non-Linear Regression (Polynomial)')
  X = df[['Total expenditure']]
  y = df['Life expectancy ']
  X = X.fillna(X.mean())
  y = y.fillna(y.mean())
  degree = 2
  model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
  model.fit(X, y)
  y_pred = model.predict(X)
  fig, ax = plt.subplots(figsize=(10, 5))
  ax.scatter(X['Total expenditure'], y, color='blue')
  ax.scatter(X['Total expenditure'], y_pred, color='red')
  ax.set_xlabel('Total expenditure')
  ax.set_ylabel('Life expectancy')
  ax.set_title('Non-Linear Regression (Polynomial)')
  display_plot(fig)

# Scatter Plot and Jitter Plot
  st.subheader('Scatter Plot and Jitter Plot')
  fig, axes = plt.subplots(1, 2, figsize=(12, 6))
  sns.scatterplot(x='percentage expenditure', y='GDP', hue='Status', data=df, ax=axes[0])
  axes[0].set_title('Scatter Plot')
  axes[0].set_xlabel('percentage expenditure')
  axes[0].set_ylabel('GDP')
  sns.stripplot(x='percentage expenditure', y='GDP', hue='Status', data=df, jitter=True, ax=axes[1])
  axes[1].set_title('Jitter Plot')
  axes[1].set_xlabel('percentage expenditure')
  axes[1].set_ylabel('GDP')
  plt.tight_layout()
  display_plot(fig)

main()
