import os
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content

def configure_model():
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
        # safety_settings = Adjust safety settings
        # See https://ai.google.dev/gemini-api/docs/safety-settings
    )
    return model

def generate_recipes():
    model = configure_model()
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
                    "{\n\"recipes\": [\n{\n\"recipe_name\": \"Classic Chocolate Chip Cookies\"\n},\n{\n\"recipe_name\": \"Chewy Sugar Cookies\"\n},\n{\n\"recipe_name\": \"Peanut Butter Cookies\"\n},\n{\n\"recipe_name\": \"Snickerdoodles\"\n},\n{\n\"recipe_name\": \"Oatmeal Raisin Cookies\"\n}\n]\n} ",
                ],
            },
        ]
    )

    response = chat_session.send_message("INSERT_INPUT_HERE")
    return response.text

if __name__ == "__main__":
    print(generate_recipes())
