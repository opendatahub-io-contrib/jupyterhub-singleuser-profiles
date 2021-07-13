export type EnvVarCategoryType = {
  name: string;
  variables: [
    {
      name: string;
      type: string;
    },
  ];
};

export type UiConfigType = {
  envVarConfig: {
    enabled: boolean;
    categories: EnvVarCategoryType[];
  };
  gpuConfig: {
    enabled: boolean;
    type: string;
    gpuDropdown?: {
      start: number;
      end: number;
    };
  };
  sizeConfig: {
    enabled: boolean;
  };
};

export type EnvVarType = {
  name: string;
  type: string;
  value: string | number;
};

export type UserConfigMapType = {
  env?: EnvVarType[];
  gpu: number;
  last_selected_image: string;
  last_selected_size: string;
};

export type ImageSoftwareType = {
  name: string;
  version?: string;
};

export type ImageTagType = {
  content?: {
    software: ImageSoftwareType[];
    dependencies: ImageSoftwareType[];
  };
  name: string;
  recommended: boolean;
  default: boolean | undefined;
  build_status: string | null;
};

export type ImageType = {
  description: string | null;
  url: string | null;
  display_name: string;
  name: string;
  order: number;
  tags?: ImageTagType[];
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
