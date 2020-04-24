import connexion

def hello_world():
    return "Hello World!"

app = connexion.App(__name__, specification_dir='.')
app.add_api('swagger.yaml')
app.run(port=8080)