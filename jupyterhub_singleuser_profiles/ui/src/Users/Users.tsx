import React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  ButtonVariant,
  Pagination,
  Spinner,
} from '@patternfly/react-core';
import { TableComposable, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { PRODUCT_NAME, USER_MANAGEMENT_URL } from '../utils/const';
import { JHUser, UsersResults } from '../utils/types';
import {
  ACTIVITY_SORT,
  NAME_SORT,
  PRIVILEGE_SORT,
  SERVER_STATUS_SORT,
  pendingMessage,
  timeSinceActive,
  userSorter,
} from '../utils/userUtils';
import { stopServerForUser } from '../utils/HubCalls';
import ConfirmationModal from '../utils/ConfirmationModal';

import './Users.scss';

type PageOptions = {
  page: number;
  perPage: number;
};

type UsersPropTypes = {
  userResults: UsersResults;
  forceUserUpdate: () => void;
  stopping: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageRef: any;
};

const Users: React.FC<UsersPropTypes> = ({ userResults, forceUserUpdate, pageRef, stopping }) => {
  const [disabledUserActions, setDisabledUserActions] = React.useState<string[]>([]);
  const [pageOptions, setPageOptions] = React.useState<PageOptions>({ page: 1, perPage: 10 });
  const [activeSort, setActiveSort] = React.useState<{ index: number; direction: 'asc' | 'desc' }>({
    index: 0,
    direction: 'desc',
  });
  const [alertClosed, setAlertClosed] = React.useState<boolean>(false);
  const [confirmationModal, setConfirmationModal] = React.useState<{
    shown: boolean;
    title?: string;
    message?: React.ReactNode;
    confirmLabel?: string;
    onConfirm?: () => void;
  }>({ shown: false });

  const startServer = (user: JHUser) => {
    window.location.href = `./spawn/${user.name}`;
  };

  const doStopServer = (user: JHUser) => {
    setDisabledUserActions((prevActions) => [...prevActions, user.name]);
    stopServerForUser(user.name).then(() => {
      setDisabledUserActions((prevActions) => {
        const index = prevActions.indexOf(user.name);
        if (index >= 0) {
          return [...prevActions.slice(0, index), ...prevActions.slice(index + 1)];
        }
        return prevActions;
      });
      forceUserUpdate();
    });
    setConfirmationModal({ shown: false });
  };

  const stopServer = (user: JHUser) => {
    setConfirmationModal({
      shown: true,
      title: 'Stop server',
      message: (
        <span>
          Are you sure you want to stop the server for <b>{user.name}</b>?
        </span>
      ),
      confirmLabel: 'Stop',
      onConfirm: () => doStopServer(user),
    });
  };

  const displayedUsers = React.useMemo(() => {
    if (!userResults.users?.length) {
      return [];
    }

    return userResults.users
      .slice()
      .sort(userSorter(activeSort.index, activeSort.direction))
      .slice((pageOptions.page - 1) * pageOptions.perPage, pageOptions.page * pageOptions.perPage);
  }, [activeSort.direction, activeSort.index, pageOptions, userResults.users]);

  const renderUsers = () => {
    if (userResults.error) {
      return (
        <Alert variant="danger" isInline title="Error loading users">
          <p>{userResults.error}</p>
        </Alert>
      );
    }
    if (!userResults.loaded) {
      return (
        <div className="jsp-admin__users__loading">
          <Spinner size="lg" />
          Loading users
        </div>
      );
    }

    return (
      <>
        <div className="jsp-admin__users__table-body">
          <TableComposable aria-label="Simple table" variant="compact">
            <Thead>
              <Tr>
                <Th
                  sort={{
                    sortBy: activeSort,
                    onSort: (e, index, direction) => setActiveSort({ index, direction }),
                    columnIndex: NAME_SORT,
                  }}
                >
                  User
                </Th>
                <Th
                  sort={{
                    sortBy: activeSort,
                    onSort: (e, index, direction) => setActiveSort({ index, direction }),
                    columnIndex: PRIVILEGE_SORT,
                  }}
                >
                  Privilege
                </Th>
                <Th
                  sort={{
                    sortBy: activeSort,
                    onSort: (e, index, direction) => setActiveSort({ index, direction }),
                    columnIndex: ACTIVITY_SORT,
                  }}
                >
                  Last activity
                </Th>
                <Th
                  className="jsp-admin__users__status-header"
                  sort={{
                    sortBy: activeSort,
                    onSort: (e, index, direction) => setActiveSort({ index, direction }),
                    columnIndex: SERVER_STATUS_SORT,
                  }}
                >
                  Server status
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayedUsers.map((user) => (
                <Tr key={user.name}>
                  <Td dataLabel="Username">{user.name}</Td>
                  <Td dataLabel="Privilege">{user.admin ? 'Admin' : 'User'}</Td>
                  <Td dataLabel="Last activity">{timeSinceActive(user)}</Td>
                  <Td dataLabel="Server">
                    <div className="jsp-admin__users__server-button">
                      {user.pending ? (
                        <Button
                          className="jsp-admin__users__status-message"
                          variant={ButtonVariant.link}
                          isDisabled
                        >
                          {pendingMessage(user.pending)}
                        </Button>
                      ) : (
                        <>
                          {user.server ? (
                            <Button
                              variant={ButtonVariant.link}
                              isDanger
                              onClick={() => stopServer(user)}
                              isDisabled={stopping || disabledUserActions.includes(user.name)}
                            >
                              Stop server
                            </Button>
                          ) : (
                            <Button
                              variant={ButtonVariant.link}
                              onClick={() => startServer(user)}
                              isDisabled={disabledUserActions.includes(user.name)}
                            >
                              Start server
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
        </div>
        {userResults.users?.length > 10 ? (
          <Pagination
            className="jsp-admin__users__pagination"
            itemCount={userResults.users.length}
            perPage={pageOptions.perPage}
            page={pageOptions.page}
            onSetPage={(e, pageNumber) =>
              setPageOptions((prev) => ({ page: pageNumber, perPage: prev.perPage }))
            }
            onPerPageSelect={(e, newPerPage) => setPageOptions({ page: 1, perPage: newPerPage })}
            perPageOptions={[
              { title: '10', value: 10 },
              { title: '20', value: 20 },
              { title: '50', value: 50 },
              { title: '100', value: 100 },
            ]}
          />
        ) : null}
      </>
    );
  };

  return (
    <div className="jsp-app__option-section jsp-admin__users m-is-top">
      {!alertClosed ? (
        <Alert
          className="jsp-admin__users__alert"
          isInline
          title="Manage users in OpenShift"
          actionClose={<AlertActionCloseButton onClose={() => setAlertClosed(true)} />}
        >
          Create, delete, and manage permissions for {PRODUCT_NAME} users in Openshift.
          {USER_MANAGEMENT_URL && (
            <span className="jsp-app__inline-link">
              <a href={USER_MANAGEMENT_URL} target="_blank" rel="noopener noreferrer">
                Learn more about OpenShift user management
                <ExternalLinkAltIcon />
              </a>
            </span>
          )}
        </Alert>
      ) : null}
      <div className="jsp-app__option-section__title">Users</div>
      {renderUsers()}
      <ConfirmationModal
        shown={confirmationModal.shown}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmLabel={confirmationModal.confirmLabel}
        onCancel={() => setConfirmationModal({ shown: false })}
        onConfirm={confirmationModal.onConfirm}
        pageRef={pageRef}
      />
    </div>
  );
};

export default Users;
