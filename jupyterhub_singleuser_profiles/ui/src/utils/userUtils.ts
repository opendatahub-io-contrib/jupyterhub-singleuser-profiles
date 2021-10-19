import moment from 'moment';
import { JHUser } from './types';
import { USER } from './const';

export const isServerRunning = (user: JHUser): boolean => {
  return !user.pending && !!user.server;
};

export const RUNNING_VALUE = 1;
export const STOPPING_VALUE = 2;
export const PENDING_VALUE = 3;
export const STARTING_VALUE = 4;
export const NOT_RUNNING_VALUE = 5;

export const STARTING_MESSAGE = 'spawn';
export const STOPPING_MESSAGE = 'stop';

export const NAME_SORT = 0;
export const PRIVILEGE_SORT = 1;
export const ACTIVITY_SORT = 2;
export const SERVER_STATUS_SORT = 3;

export const getUTCForActivity = (user: JHUser): number => {
  return user.last_activity ? Date.parse(user.last_activity) : 0;
};

export const timeSinceActive = (user: JHUser): string => {
  if (user.name === USER) {
    return 'Active';
  }
  if (user.last_activity) {
    const date = Date.parse(user.last_activity);
    const m = moment(date);
    if (m.isValid()) {
      return m.fromNow();
    }
  }

  return 'Never';
};

export const pendingMessage = (pending: string): string => {
  switch (pending) {
    case STARTING_MESSAGE:
      return 'Server starting...';
    case STOPPING_MESSAGE:
      return 'Server stopping...';
    default:
      return `Pending ${pending}`;
  }
};

export const statusValue = (user: JHUser): number => {
  if (user.pending) {
    switch (user.pending) {
      case STARTING_MESSAGE:
        return STARTING_VALUE;
      case STOPPING_MESSAGE:
        return STOPPING_VALUE;
      default:
        return PENDING_VALUE;
    }
  }
  return user.server ? RUNNING_VALUE : NOT_RUNNING_VALUE;
};

export const userStatusCompare = (a: JHUser, b: JHUser): number => {
  const aVal = statusValue(a);
  const bVal = statusValue(b);

  if (aVal === PENDING_VALUE && bVal === PENDING_VALUE) {
    return pendingMessage(b.pending).localeCompare(pendingMessage(a.pending));
  }

  return aVal - bVal;
};

export const userSorter = (column: number, direction: string) => {
  return (a: JHUser, b: JHUser): number => {
    let cmpValue;
    switch (column) {
      case NAME_SORT:
        cmpValue = b.name.localeCompare(a.name);
        break;
      case PRIVILEGE_SORT:
        if (b.admin) {
          cmpValue = a.admin ? 0 : 1;
        } else {
          cmpValue = -1;
        }
        break;
      case ACTIVITY_SORT:
        cmpValue = getUTCForActivity(b) - getUTCForActivity(a);
        break;
      case SERVER_STATUS_SORT:
        cmpValue = userStatusCompare(a, b);
        break;
      default:
        cmpValue = b.name.localeCompare(a.name);
    }
    if (direction === 'desc') {
      cmpValue = cmpValue * -1;
    }
    if (cmpValue === 0) {
      cmpValue = a.name.localeCompare(b.name);
    }
    return cmpValue;
  };
};
