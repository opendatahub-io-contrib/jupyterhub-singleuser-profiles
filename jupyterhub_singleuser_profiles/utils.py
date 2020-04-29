import escapism
import string

def escape(text):
  # Make sure text match the restrictions for DNS labels
  # Note: '-' is not in safe_chars, as it is being used as escape character
  safe_chars = set(string.ascii_lowercase + string.digits)

  return escapism.escape(text, safe=safe_chars, escape_char='-').lower()

def parse_resources(resources):
  # Kept for backwards compatibility
  if resources.get('mem_limit') or resources.get('cpu_limit'):
      return {
          'requests': {
              'memory': resources.get('mem_limit'),
              'cpu': resources.get('cpu_limit')
          },
            'limits': {
              'memory': resources.get('mem_limit'),
              'cpu': resources.get('cpu_limit')
          }
      }

  if not resources.get('requests') and not resources.get('limits'):
      return None

  if 'limits' not in resources and 'requests' in resources:
      resources['limits'] = resources['requests']

  if 'requests' not in resources and 'limits' in resources:
      resources['requests'] = resources['limits']

  return resources
