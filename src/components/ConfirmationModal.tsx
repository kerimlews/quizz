import React, { memo } from 'react';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 999,
};

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#fff',
  padding: '20px',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.25)',
  zIndex: 1000,
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  onConfirm,
  onCancel,
}) => (
  <>
    <div style={overlayStyle} onClick={onCancel} />
    <div style={modalStyle}>
      <p>{message}</p>
      <button onClick={onConfirm} style={{ marginRight: '10px' }}>
        Yes
      </button>
      <button onClick={onCancel}>No</button>
    </div>
  </>
);

export default memo(ConfirmationModal);
