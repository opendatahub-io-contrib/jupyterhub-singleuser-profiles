export type EnvVarType = {
  name: string;
  type: string;
  value: string | number;
};

export type UserConfigMapType = {
  env: EnvVarType[];
  gpu: number;
  last_selected_image: string;
  last_selected_size: string;
};

export type SizeDescription = {
  name: string;
  resources: {
    limits: {
      cpu: number;
      memory: string;
    };
    requests: {
      cpu: number;
      memory: string;
    };
  };
};
