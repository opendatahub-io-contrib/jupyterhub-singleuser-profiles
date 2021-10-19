import {
  DEV_MODE,
  DEV_SERVER,
  HUB_PATH,
  MOCK_MODE,
  SHUTDOWN_PATH,
  USER,
  USERS_PATH,
} from './const';
import { mockData } from '../__mock__/mockData';

const doSleep = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

export const getHubPath = (request: string): string => {
  const hubPath = `${HUB_PATH}/${request}`;
  if (DEV_MODE) {
    return DEV_SERVER + hubPath;
  }
  return hubPath;
};

export const getUserHubPath = (request: string): string => getHubPath(`users/${USER}/${request}`);

export const HubUserRequest = (
  method: 'GET' | 'POST' | 'DELETE',
  target: string,
  json?: string,
): Promise<Response | null> => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const requestPath = getUserHubPath(target);
  if (MOCK_MODE) {
    if (method === 'POST') {
      return doSleep(2000).then(() => {
        return { status: 202 } as Response;
      });
    }
    if (method === 'DELETE') {
      return doSleep(2000).then(() => {
        return { status: 204 } as Response;
      });
    }
    return doSleep(2000).then(() => {
      return mockData[target];
    });
  }
  return new Promise((resolve, reject) => {
    fetch(requestPath, { method, body: json, headers: headers }).then((response) => {
      if (response.ok) {
        resolve(response);
      } else {
        reject(new Error('Failed to send ' + requestPath));
      }
    });
  });
};

export const hubRequest = (
  method: 'GET' | 'POST' | 'DELETE',
  request: string,
  json?: string,
): Promise<Response | null> => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const requestPath = getHubPath(request);
  if (MOCK_MODE) {
    if (method === 'POST') {
      return doSleep(2000).then(() => {
        return { status: 202 } as Response;
      });
    }
    if (method === 'DELETE') {
      return doSleep(2000).then(() => {
        return { status: 204 } as Response;
      });
    }
    return doSleep(2000).then(() => {
      return mockData[request];
    });
  }
  return new Promise((resolve, reject) => {
    fetch(requestPath, {
      method,
      headers,
      body: json,
    }).then((response) => {
      if (response.ok) {
        resolve(response);
      } else {
        reject(new Error('Failed to send ' + requestPath));
      }
    });
  });
};

export const stopServerForUser = (username: string): Promise<Response | null> => {
  return hubRequest('DELETE', `${USERS_PATH}/${username}/server`);
};

export const shutdown = (): Promise<Response | null> => {
  return hubRequest('POST', SHUTDOWN_PATH);
};
