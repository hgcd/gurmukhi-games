import base64
from openai import OpenAI
import requests
client = OpenAI()

def generate_image_openai(word, id, save_path):
    prompt_template = (
        f"{word}, centered, plain white background"
    )
    img = client.images.generate(
        model="dall-e-3",
        prompt=prompt_template,
        n=1,
        size="1024x1024",
        style="natural"
    )
    print(img)
    image_url = img.data[0].url
    
    # Load and save the image
    response = requests.get(image_url)
    with open(f"{save_path}/{word}_{id}.png", "wb") as f:
        f.write(response.content)

def generate_image_stability(word, id, save_path):
    response = requests.post(
        f"https://api.stability.ai/v2beta/stable-image/generate/core",
        headers={
            "authorization": f"Bearer sk-MYAPIKEY",
            "accept": "image/*"
        },
        files={"none": ''},
        data={
            "prompt": f"photorealistic natural water color illustration of{word}, centered, plain light background",
            "output_format": "webp",
        },
    )

    if response.status_code == 200:
        print(response)
        with open("./lighthouse.webp", 'wb') as file:
            file.write(response.content)
    else:
        raise Exception(str(response.json()))

generate_image("apple", "0", "data/images")
