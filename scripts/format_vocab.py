import json

def get_vocab_terms(vocab_dict):
    vocab_terms = []
    for category, content in vocab_dict.items():
        for term in content["terms"]:
            vocab_terms.append({
                "topics": [category if "common" in category else "common_" + category],
                "punjabi_gurmukhi": term["punjabi_gurmukhi"],
                "punjabi_roman": term["punjabi_roman"],
                "image": term["image"] if "image" in term else "",
                "audio": term["audio"],
                "english": term["english"],
            })
    return vocab_terms

with open("learn_data/vocabulary.json", "r") as f:
    vocab_dict = json.load(f)

vocab_terms = get_vocab_terms(vocab_dict)

with open("learn_data/vocabulary_terms.json", "w") as f:
    json.dump(vocab_terms, f, indent=4, ensure_ascii=False)