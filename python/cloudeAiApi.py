from fastapi import FastAPI
from pydantic import BaseModel
from ollama import Client


class Item(BaseModel):
    content: str
    model: str


app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/cloud-ai")
def cloud_ai(item: Item):
    # 可以做成配置 比如os.environ.get('OLLAMA_API_KEY')
    ollama_api_key = '换成你的真实apiKey'
    client = Client(
        host="https://ollama.com",
        headers={'Authorization': 'Bearer ' +  ollama_api_key}
    )

    messages = [
        {'role': 'user',
         'content': '首先你是一个画家，极具美感，其次你还是一个svg绘图专家，你只根据HTML标准返回绘画结果，格式如<rect x=100 y=200 width=30 height=320 />'},
        {'role': 'user', 'content': item.content},
    ]
    result = ''
    for part in client.chat(item.model, messages=messages, stream=True):
        result = result + part['message']['content']
    return {
        "item": item,
        "result": result
    }
