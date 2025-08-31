import json

with open("data/learn_data/vocabulary_terms_v0.json", "r") as f:
    vocab_terms = json.load(f)

# Create a text file with word:image_url pairs
with open("data/learn_data/word_image_reference.txt", "w", encoding="utf-8") as f:
    for term in vocab_terms:
        gurmukhi = term["punjabi_gurmukhi"]
        image_url = term.get("image", "")  # Get image_url if exists, empty string if not
        f.write(f"{gurmukhi}: {image_url}\n")
