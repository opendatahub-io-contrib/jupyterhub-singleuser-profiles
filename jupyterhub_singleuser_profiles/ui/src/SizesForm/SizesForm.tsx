import * as React from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import { APIGet, APIPost } from '../utils/APICalls';
import { CM_PATH, SINGLE_SIZE_PATH, SIZES_PATH } from '../utils/const';
import { UserConfigMapType, SizeDescription, UiConfigType } from '../utils/types';

import './SizesForm.scss';

const MAX_GPUS = 10;

type ImageFormProps = {
  uiConfig: UiConfigType;
};

const SizesForm: React.FC<ImageFormProps> = ({ uiConfig }) => {
  const [sizeDropdownOpen, setSizeDropdownOpen] = React.useState<boolean>(false);
  const [gpuDropdownOpen, setGpuDropdownOpen] = React.useState<boolean>(false);
  const [sizeList, setSizeList] = React.useState<string[]>();
  const [sizeDescriptions, setSizeDescriptions] = React.useState<SizeDescription[]>([]);
  const [selectedSize, setSelectedSize] = React.useState<string>('Default');
  const [selectedGpu, setSelectedGpu] = React.useState<string>('0');

  const postSizeChange = (text: string): Promise<void> => {
    setSelectedSize(text);
    setSizeDropdownOpen(false);
    const json = JSON.stringify({ last_selected_size: text });
    return APIPost(CM_PATH, json);
  };

  const postGPUChange = (value: number): Promise<void> => {
    setSelectedGpu(`${value}`);
    setGpuDropdownOpen(false);
    const json = JSON.stringify({ gpu: value });
    return APIPost(CM_PATH, json);
  };

  React.useEffect(() => {
    let cancelled = false;
    APIGet(CM_PATH).then((data: UserConfigMapType) => {
      if (!cancelled) {
        setSelectedSize(data.last_selected_size);
        setSelectedGpu(`${data.gpu}`);
      }
    });
    APIGet(SIZES_PATH).then((data: string[]) => {
      if (!cancelled) {
        setSizeList(data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    if (!sizeList) {
      return;
    }
    const promises = sizeList.map((size) => APIGet(`${SINGLE_SIZE_PATH}/${size}`));
    Promise.all(promises).then((results: SizeDescription[]) => {
      if (!cancelled) {
        setSizeDescriptions(results);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sizeList]);

  React.useEffect(() => {
    if (!sizeList) {
      return;
    }

    for (let i = 0; i < sizeList.length; i++) {
      if (sizeList[i] === selectedSize || selectedSize === 'Default') {
        return;
      }
    }
    postSizeChange('Default');
  }, [selectedSize, sizeList]);

  const sizeOptions = React.useMemo(() => {
    if (!sizeList?.length) {
      return null;
    }

    const sizes = sizeList.reduce(
      (acc, size) => {
        if (!acc.includes(size)) {
          acc.push(size);
        }
        return acc;
      },
      ['Default'],
    );

    return sizes.reduce((acc, size) => {
      const sizeDescription = sizeDescriptions?.find((desc) => desc?.name === size);
      if (!sizeDescription) {
        acc.push(
          <SelectOption
            key={size}
            value={size}
            description="Resources set based on administrator configurations"
          />,
        );
      } else if (sizeDescription.schedulable !== false) {
        acc.push(
          <SelectOption
            key={size}
            value={size}
            description={
              `Limits: ${sizeDescription.resources.limits.cpu} CPU, ${sizeDescription.resources.limits.memory} Memory ` +
              `Requests: ${sizeDescription.resources.requests.cpu} CPU, ${sizeDescription.resources.requests.memory} Memory`
            }
          />,
        );
      }
      return acc;
    }, [] as React.ReactElement[]);
  }, [sizeList, sizeDescriptions]);

  const gpuOptions = React.useMemo(() => {
    const values: number[] = [];
    const start = uiConfig.gpuConfig?.gpuDropdown?.start ?? 0;
    const end = Math.max(uiConfig.gpuConfig?.gpuDropdown?.end ?? MAX_GPUS, start);

    for (let i = start; i <= end; i++) {
      values.push(i);
    }
    return values?.map((gpuSize) => <SelectOption key={gpuSize} value={`${gpuSize}`} />);
  }, [uiConfig]);

  const showSizes = sizeOptions && uiConfig.sizeConfig?.enabled !== false;
  const showGpus = uiConfig.gpuConfig?.enabled !== false;

  if (!showSizes && !showGpus) {
    return null;
  }

  return (
    <div className="jsp-spawner__option-section">
      <div className="jsp-spawner__option-section__title">Deployment size</div>
      {sizeOptions && uiConfig.sizeConfig?.enabled !== false && (
        <>
          <div className="jsp-spawner__size_options__title" id="container-size">
            Container size
          </div>
          <Select
            className="jsp-spawner__size_options__select"
            variant={SelectVariant.single}
            isOpen={sizeDropdownOpen}
            onToggle={() => setSizeDropdownOpen(!sizeDropdownOpen)}
            aria-labelledby="container-size"
            selections={selectedSize}
            onSelect={(e, selection) => postSizeChange((selection || 'Default') as string)}
          >
            {sizeOptions}
          </Select>
        </>
      )}
      {uiConfig.gpuConfig?.enabled !== false && (
        <>
          <div className="jsp-spawner__size_options__title">Number of GPUs</div>
          <Select
            className="jsp-spawner__size_options__select"
            variant={SelectVariant.single}
            isOpen={gpuDropdownOpen}
            onToggle={() => setGpuDropdownOpen(!gpuDropdownOpen)}
            aria-labelledby="container-size"
            selections={selectedGpu}
            onSelect={(e, selection) => postGPUChange(parseInt((selection || '0') as string))}
          >
            {gpuOptions}
          </Select>
        </>
      )}
    </div>
  );
};

export default SizesForm;
