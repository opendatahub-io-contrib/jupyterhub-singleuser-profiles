import * as _ from 'lodash';
import { API_BASE_PATH, DEV_MODE, DEV_SERVER, MOCK_MODE, FOR_USER } from './const';
import { mockData } from '../__mock__/mockData';

const getRequestPath = (target: string) => {
  if (DEV_MODE) {
    return DEV_SERVER + API_BASE_PATH + target;
  }
  return API_BASE_PATH + target;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const APIGet = (target: string): Promise<any> => {
  const headers = {};
  if (FOR_USER) {
    headers['For-User'] = FOR_USER;
  }

  if (MOCK_MODE) {
    return Promise.resolve(_.cloneDeep(mockData[target]));
  }

  return new Promise((resolve, reject) => {
    const url = getRequestPath(target);
    fetch(url, { method: 'GET', headers: headers })
      .then((response) => {
        if (response.ok) {
          resolve(response.json());
        } else {
          reject(`Failed to fetch ${target}: ${response.statusText}`);
        }
      })
      .catch((err) => {
        console.error(`Unable to Fetch ${target}`);
        console.dir(err);
        reject(err.message);
      });
  });
};

export const APIPost = (target: string, json: string): Promise<void> => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (FOR_USER) {
    headers['For-User'] = FOR_USER;
  }

  if (MOCK_MODE) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    fetch(getRequestPath(target), { method: 'POST', body: json, headers: headers })
      .then((response) => {
        if (response.ok) {
          resolve();
        } else {
          reject(`Failed to send ${target}: ${response.statusText}`);
        }
      })
      .catch((err) => {
        console.error(`Unable to send ${target}`);
        console.dir(err);
        reject(err.message);
      });
  });
};
