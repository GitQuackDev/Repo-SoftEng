from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from tensorflow.keras.applications.resnet50 import ResNet50, decode_predictions, preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
import io
from PIL import Image
import requests
import re
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Load the pre-trained ResNet50 model
model = ResNet50(weights="imagenet")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "FastAPI is running!"}

def fetch_wikidata_facts(query):
    # Step 1: Search for the entity
    search_url = f"https://www.wikidata.org/w/api.php?action=wbsearchentities&search={query}&language=en&format=json"
    try:
        r = requests.get(search_url)
        if r.status_code == 200:
            data = r.json()
            if data.get("search"):
                entity_id = data["search"][0]["id"]
                # Step 2: Fetch entity data
                entity_url = f"https://www.wikidata.org/wiki/Special:EntityData/{entity_id}.json"
                r2 = requests.get(entity_url)
                if r2.status_code == 200:
                    entity_data = r2.json()
                    entity = entity_data["entities"][entity_id]
                    claims = entity.get("claims", {})
                    labels = entity.get("labels", {})
                    descriptions = entity.get("descriptions", {})
                    facts = {}
                    # Label and description
                    facts["wikidata_label"] = labels.get("en", {}).get("value")
                    facts["wikidata_description"] = descriptions.get("en", {}).get("value")
                    # Inventor (P61)
                    if "P61" in claims:
                        inventor = claims["P61"][0]["mainsnak"]["datavalue"]["value"]
                        if isinstance(inventor, dict) and "id" in inventor:
                            inventor_id = inventor["id"]
                            inventor_url = f"https://www.wikidata.org/wiki/Special:EntityData/{inventor_id}.json"
                            r3 = requests.get(inventor_url)
                            if r3.status_code == 200:
                                inventor_data = r3.json()
                                inventor_entity = inventor_data["entities"][inventor_id]
                                inventor_label = inventor_entity.get("labels", {}).get("en", {}).get("value")
                                facts["inventor"] = inventor_label
                    # Use (P366)
                    if "P366" in claims:
                        use = claims["P366"][0]["mainsnak"]["datavalue"]["value"]
                        if isinstance(use, dict) and "id" in use:
                            use_id = use["id"]
                            use_url = f"https://www.wikidata.org/wiki/Special:EntityData/{use_id}.json"
                            r4 = requests.get(use_url)
                            if r4.status_code == 200:
                                use_data = r4.json()
                                use_entity = use_data["entities"][use_id]
                                use_label = use_entity.get("labels", {}).get("en", {}).get("value")
                                facts["use"] = use_label
                    # Instance of (P31)
                    if "P31" in claims:
                        instance = claims["P31"][0]["mainsnak"]["datavalue"]["value"]
                        if isinstance(instance, dict) and "id" in instance:
                            instance_id = instance["id"]
                            instance_url = f"https://www.wikidata.org/wiki/Special:EntityData/{instance_id}.json"
                            r5 = requests.get(instance_url)
                            if r5.status_code == 200:
                                instance_data = r5.json()
                                instance_entity = instance_data["entities"][instance_id]
                                instance_label = instance_entity.get("labels", {}).get("en", {}).get("value")
                                facts["instance_of"] = instance_label
                    # Image (P18)
                    if "P18" in claims:
                        image_name = claims["P18"][0]["mainsnak"]["datavalue"]["value"]
                        # Convert Wikimedia image name to URL
                        commons_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{re.sub(' ', '_', image_name)}"
                        facts["wikidata_image"] = commons_url
                    return facts
    except Exception as e:
        return {"wikidata_error": str(e)}
    return {}

def fetch_duckduckgo_info(query):
    ddg_url = f"https://api.duckduckgo.com/?q={query}&format=json"
    try:
        r = requests.get(ddg_url)
        if r.status_code == 200:
            data = r.json()
            # Extract related topics as a list of strings
            related = []
            for topic in data.get("RelatedTopics", []):
                if isinstance(topic, dict):
                    if "Text" in topic:
                        related.append(topic["Text"])
                    # Some topics have a 'Topics' list
                    if "Topics" in topic:
                        for subtopic in topic["Topics"]:
                            if "Text" in subtopic:
                                related.append(subtopic["Text"])
            return {
                "summary": data.get("AbstractText"),
                "image": data.get("Image"),
                "url": data.get("AbstractURL"),
                "heading": data.get("Heading"),
                "related": related,
                "description": data.get("Description"),
                "type": data.get("Type"),
            }
    except Exception as e:
        return {"error": str(e)}
    return {}

def fetch_wikipedia_info(query):
    wiki_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{query}"
    try:
        r = requests.get(wiki_url)
        if r.status_code == 200:
            data = r.json()
            return {
                "summary": data.get("extract"),
                "image": data.get("thumbnail", {}).get("source"),
                "url": data.get("content_urls", {}).get("desktop", {}).get("page"),
                "heading": data.get("title"),
                "description": data.get("description"),
                "type": data.get("type"),
            }
    except Exception as e:
        return {"error": str(e)}
    return {}

def fetch_wikipedia_sections(query):
    summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{query}"
    r = requests.get(summary_url)
    if r.status_code != 200:
        return {}
    data = r.json()
    title = data.get("title", query)
    sections_url = f"https://en.wikipedia.org/api/rest_v1/page/mobile-sections/{title}"
    r = requests.get(sections_url)
    if r.status_code != 200:
        return {}
    data = r.json()
    sections = data.get("remaining", {}).get("sections", [])
    info = {}
    for section in sections:
        heading = section.get("line", "").lower()
        text = section.get("text", "")
        if "history" in heading:
            info["history"] = text
        if "use" in heading or "application" in heading:
            info["uses"] = text
        if "invent" in heading or "origin" in heading or "creator" in heading:
            info["inventor"] = text
    return info

def fetch_wikipedia_info_with_context(query, context_list=None):
    # Try the original query
    info = fetch_wikipedia_info(query)
    # If ambiguous, try with context
    if info.get("type") == "disambiguation" and context_list:
        for context in context_list:
            refined_query = f"{query}_{context}".replace(' ', '_')
            refined_info = fetch_wikipedia_info(refined_query)
            if refined_info.get("summary") and refined_info.get("type") != "disambiguation":
                return refined_info
    return info

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Read image file
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    preds = model.predict(x)
    decoded = decode_predictions(preds, top=3)[0]
    predictions = [
        {"className": pred[1], "confidence": float(pred[2])}
        for pred in decoded
    ]

    top_class = predictions[0]["className"].replace('_', ' ')
    ddg_query = f"what is a {top_class}"
    ddg_info = fetch_duckduckgo_info(ddg_query)
    context_list = ["computer", "device", "tool", "object", "technology"]
    if not ddg_info.get("summary"):
        wiki_query = top_class.replace(' ', '_')
        wiki_info = fetch_wikipedia_info_with_context(wiki_query, context_list)
        wiki_sections = fetch_wikipedia_sections(wiki_query)
        wikidata_facts = fetch_wikidata_facts(top_class)
        info = {**wiki_info, **wiki_sections, **wikidata_facts} if wiki_info.get("summary") else {**ddg_info, **wikidata_facts}
    else:
        wiki_query = top_class.replace(' ', '_')
        wiki_sections = fetch_wikipedia_sections(wiki_query)
        wikidata_facts = fetch_wikidata_facts(top_class)
        info = {**ddg_info, **wiki_sections, **wikidata_facts}
    if info.get("type") == "disambiguation":
        info["ambiguous"] = True
    return JSONResponse({"predictions": predictions, "info": info})
