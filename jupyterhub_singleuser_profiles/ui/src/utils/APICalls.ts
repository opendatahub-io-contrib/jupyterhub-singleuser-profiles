import { API_BASE_PATH, DEV_MODE, DEV_SERVER, MOCK_MODE } from './const';
import { mockData } from '../__mock__/mockData';

const getRequestPath = (target: string) => {
  if (DEV_MODE) {
    return DEV_SERVER + API_BASE_PATH + target;
  }
  return API_BASE_PATH + target;
};

const getForUser = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const jhdata = window.jhdata;

  if (jhdata?.['for_user']) {
    return jhdata['for_user'];
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const APIGet = (target: string): Promise<any> => {
  const targetUser = getForUser();
  const headers = {};
  if (targetUser) {
    headers['For-User'] = targetUser;
  }

  if (MOCK_MODE) {
    return Promise.resolve(mockData[target]);
  }

  return new Promise((resolve) => {
    const url = getRequestPath(target);
    fetch(url, { method: 'GET', headers: headers })
      .then((response) => {
        if (response.ok) {
          resolve(response.json());
        } else {
          throw new Error('Failed to fetch ' + target + response);
        }
      })
      .catch((err) => {
        console.error(`Unable to Fetch ${target}`);
        console.dir(err);
      });
  });
};

export const APIPost = (target: string, json: string): Promise<void> => {
  const targetUser = getForUser();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (targetUser) {
    headers['For-User'] = targetUser;
  }

  if (MOCK_MODE) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    fetch(getRequestPath(target), { method: 'POST', body: json, headers: headers }).then(
      (response) => {
        if (response.ok) {
          resolve();
        } else {
          throw new Error('Failed to send ' + target);
        }
      },
    );
  });
};
