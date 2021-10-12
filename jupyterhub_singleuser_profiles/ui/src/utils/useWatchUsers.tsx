import * as React from 'react';
import { hubRequest } from './HubCalls';
import { UsersResults } from './types';

export const useWatchUsers = (forceCount: number): UsersResults => {
  const [results, setResults] = React.useState<UsersResults>({ users: [], loaded: false });

  React.useEffect(() => {
    let watchHandle;
    const watchUsers = () => {
      hubRequest('GET', 'users')
        .then((response) => {
          return response?.json();
        })
        .then((updatedUsers) => {
          setResults({ users: updatedUsers, loaded: true });
        })
        .catch((e) => {
          setResults((prevResults) => ({
            users: prevResults.users,
            loaded: prevResults.loaded,
            error: e.response?.body?.message || e.message || e,
          }));
        })
        .finally(() => {
          watchHandle = setTimeout(watchUsers, 30000);
        });
    };
    watchUsers();
    return () => {
      if (watchHandle) {
        clearTimeout(watchHandle);
      }
    };
  }, [forceCount]);

  return results;
};
