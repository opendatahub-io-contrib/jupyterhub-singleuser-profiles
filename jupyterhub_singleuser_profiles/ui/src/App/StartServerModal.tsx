import * as React from 'react';
import classNames from 'classnames';
import {
  Accordion,
  AccordionItem,
  AccordionToggle,
  AccordionContent,
  Alert,
  Button,
  Modal,
  ModalVariant,
  Progress,
  ProgressVariant,
} from '@patternfly/react-core';
import { APIGet } from '../utils/APICalls';
import { HubUserRequest } from '../utils/HubCalls';
import { useWatchSpawnProgress } from '../utils/useWatchSpawnProgress';
import { CM_PATH, DEV_MODE, FOR_USER, USER } from '../utils/const';
import { UserConfigMapType } from '../utils/types';

import './StartServerModal.scss';

type StartServerModalProps = {
  shown: boolean;
  onClose: () => void;
  pageRef?: HTMLElement;
};

type SpawnStatus = {
  status: 'success' | 'danger' | 'warning' | 'info' | 'default';
  title: string;
  reason: React.ReactNode;
};

const StartServerModal: React.FC<StartServerModalProps> = ({ shown, onClose, pageRef }) => {
  const [spawnInProgress, setSpawnInProgress] = React.useState<boolean>(false);
  const [expandMessages, setExpandMessages] = React.useState<boolean>(false);
  const spawnProgress = useWatchSpawnProgress(spawnInProgress);
  const [spawnStatus, setSpawnStatus] = React.useState<SpawnStatus | null>(null);

  const startSpawnServer = React.useCallback(() => {
    setSpawnStatus(null);

    APIGet(CM_PATH).then((data: UserConfigMapType) => {
      const body = JSON.stringify(data);

      HubUserRequest('POST', 'server', body)
        .then((response) => {
          if (DEV_MODE) {
            setSpawnInProgress(true);
            return;
          }
          if (response?.status === 202) {
            HubUserRequest('GET', 'server/progress')
              .then((response) => {
                if (response?.status !== 400) {
                  setSpawnInProgress(true);
                }
              })
              .catch((e) => {
                setSpawnStatus({
                  status: 'warning',
                  title: 'Unable to get progress for server startup.',
                  reason: e.message,
                });
              });
            return;
          }
          if (response?.status === 201) {
            setSpawnStatus({
              status: 'success',
              title: 'Success',
              reason: 'The notebook server is up and running. This page will update momentarily.',
            });
            setTimeout(() => window.location.reload(), 8000);
          }
          if (response?.status === 404) {
            setSpawnStatus({
              status: 'danger',
              title: 'Server request failed to start',
              reason: (
                <span>
                  User <b>{FOR_USER || USER}</b> does not exist
                </span>
              ),
            });
            setTimeout(() => window.location.reload(), 8000);
          }
        })
        .catch((e) => {
          setSpawnStatus({
            status: 'danger',
            title: 'Server request failed to start',
            reason: e.message,
          });
        });
    });
  }, []);

  const stopSpawnServer = React.useCallback((): Promise<boolean> => {
    setSpawnStatus(null);
    return HubUserRequest('DELETE', 'server')
      .then((res) => {
        if (res?.status === 204) {
          setSpawnStatus({
            status: 'default',
            title: 'The server has been stopped.',
            reason: '',
          });
          return true;
        }
        setSpawnStatus({
          status: 'warning',
          title: 'Server is still running.',
          reason:
            'The notebook server has not yet stopped as it is taking a while to stop.\n' +
            'Please try again in a few minutes.',
        });
        return false;
      })
      .catch((e) => {
        setSpawnStatus({
          status: 'danger',
          title: 'Unable to stop current server.',
          reason: 'The notebook server could not be stopped.\n' + e.message,
        });
        return false;
      });
  }, []);

  const retrySpawn = React.useCallback(() => {
    if (DEV_MODE) {
      startSpawnServer();
    }
    stopSpawnServer().then((success) => {
      if (success) {
        startSpawnServer();
      }
    });
  }, [startSpawnServer, stopSpawnServer]);

  React.useEffect(() => {
    // Modal opened, Start spawning (ok to attempt to start even if already in progress)
    if (shown) {
      startSpawnServer();
    }
  }, [shown, startSpawnServer]);

  React.useEffect(() => {
    if (!spawnProgress) {
      return;
    }

    if (spawnProgress.failed) {
      setSpawnStatus({
        status: 'danger',
        title: 'Spawn failed',
        reason: spawnProgress.lastMessage,
      });
      setSpawnInProgress(false);
    }
    if (spawnProgress.ready) {
      setSpawnStatus({
        status: 'success',
        title: 'Success',
        reason: 'The notebook server is up and running. This page will update momentarily.',
      });
      setTimeout(() => window.location.reload(), 8000);
    }
  }, [spawnProgress]);

  const getMessageText = (message) => {
    if (!message) {
      return message;
    }
    const parts = message.split(' ');
    if (parts.length < 3) {
      return message;
    }
    const date = Date.parse(parts[0]);
    if (Number.isNaN(date)) {
      return message;
    }
    return parts.slice(2).join(' ');
  };

  const renderProgress = () => {
    let variant;
    switch (spawnStatus?.status) {
      case 'danger':
        variant = ProgressVariant.danger;
        break;
      case 'success':
        variant = ProgressVariant.success;
        break;
      case 'warning':
        variant = ProgressVariant.warning;
        break;
      default:
        variant = undefined;
    }
    return (
      <div className="jsp-spawner__start-modal__progress">
        <Progress
          id="progress-bar"
          value={spawnProgress?.percentComplete ?? 0}
          title={
            spawnProgress.messages.length
              ? getMessageText(spawnProgress.messages[spawnProgress.messages.length - 1])
              : 'Waiting for server request to start...'
          }
          variant={variant}
        />
      </div>
    );
  };

  const renderStatus = () => {
    if (!spawnStatus) {
      return;
    }
    return (
      <div className="jsp-spawner__start-modal__status">
        <Alert isInline variant={spawnStatus.status} title={spawnStatus.title}>
          <p>{spawnStatus.reason}</p>
        </Alert>
      </div>
    );
  };

  const toggleClasses = classNames('jsp-spawner__start-modal__accordion-toggle', {
    'm-is-disabled': !spawnProgress.messages.length,
  });
  const renderMessages = () => {
    return (
      <div className="jsp-spawner__start-modal__footer">
        <Accordion
          asDefinitionList={false}
          headingLevel="h5"
          className="jsp-spawner__start-modal__accordion"
        >
          <AccordionItem>
            <AccordionToggle
              onClick={() => setExpandMessages((prev) => !prev)}
              isExpanded={expandMessages}
              id="messages-toggle"
              className={toggleClasses}
            >
              <div className="jsp-spawner__start-modal__toggle-title">
                {expandMessages ? 'Collapse event log' : 'Expand event log'}
              </div>
            </AccordionToggle>
            <AccordionContent
              isHidden={!expandMessages}
              className="jsp-spawner__start-modal__accordion-body"
            >
              {spawnProgress.messages.map((message, index) => (
                <div key={index} className="jsp-spawner__start-modal__message">
                  {message}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  };

  return (
    <Modal
      aria-label="Starting server"
      className="jsp-spawner jsp-spawner__start-modal"
      appendTo={pageRef}
      variant={ModalVariant.small}
      title="Starting server"
      isOpen={shown}
      showClose={spawnStatus?.status === 'danger' || spawnStatus?.status === 'warning'}
      onClose={onClose}
    >
      <span>
        Depending on the size and resources requested, this can take several minutes. To track
        progress, expand the event log.
      </span>
      {renderProgress()}
      {renderStatus()}
      <div>
        {spawnStatus?.status === 'danger' || spawnStatus?.status === 'warning' ? (
          <div className="jsp-spawner__start-modal__buttons">
            <Button key="retry" variant="primary" onClick={retrySpawn}>
              Try again
            </Button>
            <Button key="cancel" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : null}
        {renderMessages()}
      </div>
    </Modal>
  );
};

export default StartServerModal;
