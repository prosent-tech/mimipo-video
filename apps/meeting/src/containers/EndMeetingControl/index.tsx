// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ControlBarButton,
  Phone,
  Modal,
  ModalBody,
  ModalHeader,
  ModalButton,
  ModalButtonGroup,
} from 'amazon-chime-sdk-component-library-react';

import { StyledP } from './Styled';
import routes from '../../constants/routes';

const EndMeetingControl: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = (): void => setShowModal(!showModal);
  const navigate = useNavigate();

  const leaveMeeting = async (): Promise<void> => {
    navigate(routes.HOME);
  };

  return (
    <>
      <ControlBarButton icon={<Phone />} onClick={toggleModal} label="" />
      {showModal && (
        <Modal size="md" onClose={toggleModal} rootId="modal-root">
          <ModalHeader title="会議を終了する" />
          <ModalBody>
            <StyledP>
              会議から退席するか、会議を終了することができます。会議が終了すると使用できなくなります。
            </StyledP>
          </ModalBody>
          <ModalButtonGroup
            primaryButtons={[
              <ModalButton
                key="leave-meeting"
                onClick={leaveMeeting}
                variant="primary"
                label="退出する"
                closesModal
              />,
              <ModalButton key="cancel-meeting-ending" variant="secondary" label="退出しない" closesModal />,
            ]}
          />
        </Modal>
      )}
    </>
  );
};

export default EndMeetingControl;
