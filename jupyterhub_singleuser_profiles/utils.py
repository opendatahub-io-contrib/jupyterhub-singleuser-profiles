import re

#TODO use proper escaping
def escape(text):
  import re
  return re.sub("[^a-zA-Z0-9]+", "-", text)