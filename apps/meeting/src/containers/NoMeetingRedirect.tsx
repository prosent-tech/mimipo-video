// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMeetingManager,
  useNotificationDispatch,
  Severity,
  ActionType,
} from 'amazon-chime-sdk-component-library-react';

import routes from '../constants/routes';

const NoMeetingRedirect: React.FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useNotificationDispatch();
  const meetingManager = useMeetingManager();

  const payload: { severity: Severity; message: string, autoClose: boolean } = {
    severity: Severity.INFO,
    message: '会議が見つかりません。有効な会議 ID を入力してください',
    autoClose: true,
  };

  useEffect(() => {
    if (!meetingManager.meetingSession) {
      dispatch({
        type: ActionType.ADD,
        payload: payload,
      });
      navigate(routes.HOME);
    }
  }, []);

  return <>{children}</>;
};

export default NoMeetingRedirect;
