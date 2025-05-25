// src/components/LogoutModal.js
import React from 'react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>로그아웃하시겠습니까?</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="modal-confirm">예</button>
          <button onClick={onClose} className="modal-cancel">아니오</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;