import os
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content
import json

def generate_recipes():
    genai.configure(api_key=os.environ["AIzaSyDzUMB9-zViLm0Ltar3GcqsjpJHQiAgeIE"])

    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_schema": content.Schema(
            type=content.Type.OBJECT,
            description="Return some of the most popular cookie recipes",
            properties={
                'recipes': content.Schema(
                    type=content.Type.ARRAY,
                    items=content.Schema(
                        type=content.Type.OBJECT,
                        properties={
                            'recipe_name': content.Schema(
                                type=content.Type.STRING,
                                description="name of the recipe",
                            ),
                        },
                    ),
                ),
            },
        ),
        "response_mime_type": "application/json",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
    )

    chat_session = model.start_chat(
        history=[
            {
                "role": "user",
                "parts": [
                    "Generate a list of cookie recipes. Make the outputs in JSON format.",
                ],
            },
            {
                "role": "model",
                "parts": [
                    '{"recipes": [{"recipe_name": "Classic Chocolate Chip Cookies"}, {"recipe_name": "Chewy Sugar Cookies"}, {"recipe_name": "Peanut Butter Cookies"}, {"recipe_name": "Snickerdoodles"}, {"recipe_name": "Oatmeal Raisin Cookies"}]}',
                ],
            },
        ]
    )

    response = chat_session.send_message("Generate a list of cookie recipes in JSON format.")
    return response.text

if __name__ == "__main__":
    recipes = generate_recipes()
    print(json.dumps(recipes))
