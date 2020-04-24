import connexion

class API():

    def __init__(self, sizes):
        self.sizes = sizes
    
    def get_sizes(self):
        return self.sizes


app = connexion.App(__name__, specification_dir='.', options={"swagger_ui": True})
app.add_api('api_def.yaml')
app.run(port=8080)