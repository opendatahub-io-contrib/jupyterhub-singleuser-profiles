import numbers

class UIConfig():
    def __init__(self, ui):
        self.ui = ui

    def get_parsed(self):
        uiconfig = []
        gpu = GpuConfig(self.ui.get('gpuConfig', {}))
        image = ImageConfig(self.ui.get('imageConfig', {}))
        size = SizeConfig(self.ui.get('sizeConfig', {}))
        envvar = EnvVarConfig(self.ui.get('envVarConfig', {}))

        uiconfig.extend(gpu.parse())


class GpuConfig():
    def __init__(self, gpu_config):
        self.gpu_config
    
    def parse(self):
        if self.gpu_config.get('type') == "checkbox":
            inner_config = GpuCheckbox(self.gpu_config.get('GpuCheckbox'))
            self.gpu_config['GpuCheckbox'] = inner_config.get_parsed()
        elif self.gpu_config.get('type') == "dropdown":
            inner_config = GpuDropdown(self.gpu_config.get('GpuDropdown'))
            self.gpu_config['GpuDropdown'] = inner_config.get_parsed()
        else:
            inner_config = GpuInput(self.gpu_config.get('GpuInput'))
            self.gpu_config['GpuInput'] = inner_config.get_parsed()



class GpuCheckbox():
    def __init__(self, config):
        self.config = config
    
    def get_parsed(self):
        value = self.config.get('value')
        if isinstance(value, numbers.Number):
            return self.config
        else:
            return ''

class GpuInput():
    def __init__(self):
        pass

class GpuDropdown():
    def __init__(self, config):
        self.config = config
    
    def get_parsed(self):
        range_values = self.config.get('range')
        if isinstance(range_values.get('start'), numbers.Number) and isinstance(range_values.get('end'), numbers.Number):
            return self.config
        else:
            return ''

class ImageConfig():
    def __init__(self, image_config):
        self.image_config = image_config

class EnvVarConfig():
    def __init__(self, envvar_config):
        self.envvar_config = envvar_config

class SizeConfig():
    def __init__(self, size_config):
        self.size_config = size_config