import * as React from 'react';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';

type ConfirmationModalProps = {
  shown: boolean;
  title?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageRef: any;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  shown,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
  pageRef,
}) => {
  if (!shown) {
    return null;
  }

  return (
    <Modal
      variant={ModalVariant.small}
      title={title}
      appendTo={pageRef}
      isOpen
      onClose={onCancel}
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={() => onConfirm && onConfirm()}
        >
          {confirmLabel}
        </Button>,
        <Button key="cancel" variant="link" onClick={() => onCancel && onCancel()}>
          Cancel
        </Button>,
      ]}
    >
      {message}
    </Modal>
  );
};

export default ConfirmationModal;
