import google.generativeai as genai
import os
from PIL import Image
from dotenv import load_dotenv
import requests
from io import BytesIO

# Load environment variables
load_dotenv()

# Configure Gemini
print("Initializing Gemini model...")
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

try:
    gemini_model = genai.GenerativeModel('gemini-1.5-flash',
        generation_config={
            "temperature": 0.1,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 20,
        }
    )
    print("Gemini model initialized successfully")

    # Test with a simple prompt first
    print("\nTesting with simple prompt...")
    response = gemini_model.generate_content("Say hi")
    print("Simple prompt response:", response.text)

    # Now test with an image
    print("\nTesting with image...")
    
    # Function to process image
    def process_image(image_path):
        # Open the image
        image = Image.open(image_path)
        
        # Handle orientation
        if hasattr(image, '_getexif') and image._getexif():
            exif = image._getexif()
            if exif:
                orientation = exif.get(274)  # 274 is the orientation tag
                if orientation == 6:
                    image = image.rotate(270, expand=True)
                elif orientation == 8:
                    image = image.rotate(90, expand=True)
                elif orientation == 3:
                    image = image.rotate(180, expand=True)
        
        # Resize image
        max_size = 512
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        return image

    # Replace this path with your actual image path
    image_path = "test_image.jpg"  # You'll need to provide an actual image
    image = process_image(image_path)
    
    prompt = """Classify this waste item into ONE of these categories:
    - aerosol_cans
    - aluminum_food_cans
    - aluminum_soda_cans
    - cardboard_boxes
    - cardboard_packaging
    - clothing
    - coffee_grounds
    - disposable_plastic_cutlery
    - eggshells
    - food_waste
    - glass_beverage_bottles
    - glass_cosmetic_containers
    - glass_food_jars
    - magazines
    - newspaper
    - office_paper
    - paper_cups
    - plastic_cup_lids
    - plastic_detergent_bottles
    - plastic_food_containers
    - plastic_shopping_bags
    - plastic_soda_bottles
    - plastic_straws
    - plastic_trash_bags
    - plastic_water_bottles
    - shoes
    - steel_food_cans
    - styrofoam_cups
    - styrofoam_food_containers
    - tea_bags
    - unknown

    Respond with ONLY the category name from the list above, nothing else."""

    print("\nSending image to Gemini...")
    print(f"Image size: {image.size}, Mode: {image.mode}")
    
    response = gemini_model.generate_content([prompt, image])
    print("Image classification response:", response.text)

except Exception as e:
    print("Error:", str(e))
    print("Error type:", type(e)) 