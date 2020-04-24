import connexion

def hello_world():
    return "Hello World!"

app = connexion.App(__name__, specification_dir='.', options={"swagger_ui": True})
app.add_api('api_def.yaml')
app.run(port=8080)