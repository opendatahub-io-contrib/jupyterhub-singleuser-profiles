from pydantic import BaseModel, ValidationError, validator
from typing import Union, Dict, Any
import json
import logging

_LOGGER = logging.getLogger(__name__)
DEFAULT_FREQ_KEYS = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"] # This should go to jupyterhub_config?

class GpuCheckbox(BaseModel):
    value: int = 1

class GpuDropdown(BaseModel):
    start: int = 0
    end: int = 1

class GpuInput(BaseModel):
    limit: int = 1

class GpuConfig(BaseModel):
    enabled: bool = True
    type: str

    @classmethod
    def create(cls, dict_:Dict[str, Any]) -> "GpuConfig":
        v = dict_.get("config")
        if v is None and dict_.get('type') is not None:
            raise ValueError("No config supplied")
        if dict_.get('type') is None:
            v = None
            return cls(enabled=dict_.get('enabled'))
        if dict_['type'] == 'checkbox':
            v = GpuCheckbox(**v)
        elif dict_['type'] == 'dropdown':
            v = GpuDropdown(**v)
        elif dict_['type'] == 'input':
            v = GpuInput(**v)
        else:
            raise ValueError(f"Unknown type {dict_['type']}")
        instance = cls(enabled=dict_.get('enabled'), type=dict_.get('type'), config=v)
        return instance

class ImageConfig(BaseModel):
    blacklist: list = []
    sort: str
    #Should not be used, can lock a user out.
    #enabled: bool = True

    @validator('sort')
    def sort_type(cls, v):
        if v in ['name', 'version']:
            return v
        else:
            raise ValueError('Sort type \"%s\" invalid' % v)

class SizeConfig(BaseModel):
    enabled: bool = True

class EnvVarConfig(BaseModel):
    freq_keys: list = DEFAULT_FREQ_KEYS
    enabled: bool = True

class UIConfigModel(BaseModel):
    gpuConfig: GpuConfig = {}
    imageConfig: ImageConfig = {}
    sizeConfig: SizeConfig = {}
    envVarConfig: EnvVarConfig = {}

class UIConfig():

    def __init__(self, ui_cfg, default_freq_keys=[]):
        self.default_freq_keys = default_freq_keys
        self.ui_cfg = ui_cfg
    
    def validate_ui_cm(self):
        
        try:
            for key, value in self.ui_cfg.items():
                if key == "gpuConfig":
                    value = GpuConfig.create(value)
                if key == "imageConfig":
                    value = ImageConfig(**value)
                if key == "sizeConfig":
                    value = SizeConfig(**value)
                if key == "envVarConfig":
                    value = EnvVarConfig(**value)
        except ValidationError as e:
            _LOGGER.error("UI ConfigMap validation failed! %s" % e)
            return json.dumps({})
        ui = UIConfigModel(**self.ui_cfg)
        return ui.dict()
