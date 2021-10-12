import React from 'react';
import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/patternfly-addons.css';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { stopServerForUser } from '../utils/HubCalls';
import { useWatchUsers } from '../utils/useWatchUsers';
import ConfirmationModal from '../utils/ConfirmationModal';
import { isServerRunning } from '../utils/userUtils';
import Users from '../Users/Users';

import './App.scss';

const Admin: React.FC = () => {
  const [forceCount, setForceCount] = React.useState<number>(0);
  const userResults = useWatchUsers(forceCount);
  const [stopping, setStopping] = React.useState<boolean>(false);
  const [confirmationModal, setConfirmationModal] = React.useState<{
    shown: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    onConfirm?: () => void;
  }>({ shown: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageRef = React.useRef<any>();

  const doStopAll = () => {
    setStopping(true);
    const stopRequests = userResults.users.map((user) => stopServerForUser(user.name));
    Promise.all(stopRequests).then(() => {
      forceUserUpdate();
      setStopping(false);
    });
    setConfirmationModal({ shown: false });
  };

  const stopAll = () => {
    setConfirmationModal({
      shown: true,
      title: 'Stop all servers',
      message: 'Are you sure you want to stop the servers for all users?',
      confirmLabel: 'Stop',
      onConfirm: doStopAll,
    });
  };

  const forceUserUpdate = (): void => {
    setForceCount((prevCount) => prevCount + 1);
  };

  const runningCount = userResults.users.filter((u) => isServerRunning(u)).length;

  return (
    <div className="jsp-app jsp-admin" ref={pageRef}>
      <div className="jsp-app__header">
        <div className="jsp-app__header__title-line">
          <div className="jsp-app__header__title">Administration</div>
          <div className="jsp-admin__buttons-bar">
            <Button
              variant={ButtonVariant.secondary}
              isDanger
              onClick={() => stopAll()}
              isDisabled={runningCount === 0}
            >
              Stop all servers ({runningCount})
            </Button>
          </div>
        </div>
        <div className="jsp-app__header__sub-title">Manage notebook servers.</div>
      </div>
      <Users
        userResults={userResults}
        forceUserUpdate={forceUserUpdate}
        pageRef={pageRef.current}
        stopping={stopping}
      />
      <ConfirmationModal
        shown={confirmationModal.shown}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmLabel={confirmationModal.confirmLabel}
        onCancel={() => setConfirmationModal({ shown: false })}
        onConfirm={confirmationModal.onConfirm}
        pageRef={pageRef.current}
      />
    </div>
  );
};

export default Admin;
