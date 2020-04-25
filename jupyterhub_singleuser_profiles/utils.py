import escapism
import string

def escape(text):
  # Make sure text match the restrictions for DNS labels
  # Note: '-' is not in safe_chars, as it is being used as escape character
  safe_chars = set(string.ascii_lowercase + string.digits)

  return escapism.escape(text, safe=safe_chars, escape_char='-').lower()