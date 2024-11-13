import os
import google.generativeai as genai
from dotenv import load_dotenv

def load_api_key():
  """Loads the API key from the .env file."""
  load_dotenv()
  api_key = os.getenv("GEMINI_API_KEY")
  return api_key

def generate_creative_prompt(task):
  """Generates a creative prompt for a given task."""
  api_key = load_api_key()
#   print(f"API KEY IS : {api_key}")
  genai.configure(api_key=api_key)

  model = genai.GenerativeModel(model_name="gemini-1.5-flash")
  prompt = f"Generate a creative prompt to help me with {task}. Make it inspiring and motivating."
  response = model.generate_content(prompt)

  return response.text

if __name__ == "__main__":
  task = input("Enter your task: ")
  creative_prompt = generate_creative_prompt(task)
  print(f"Creative Prompt: {creative_prompt}")