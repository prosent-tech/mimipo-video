// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { ChangeEvent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DeviceLabels,
  Flex,
  FormField,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  PrimaryButton,
  useMeetingManager,
} from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';

import { getErrorContext } from '../../providers/ErrorProvider';
import routes from '../../constants/routes';
import Card from '../../components/Card';
import Spinner from '../../components/icons/Spinner';
import DevicePermissionPrompt from '../DevicePermissionPrompt';
import { createGetAttendeeCallback, createMeetingAndAttendee } from '../../utils/api';
import { useAppState } from '../../providers/AppStateProvider';
import { MeetingMode } from '../../types';
import { MeetingManagerJoinOptions } from 'amazon-chime-sdk-component-library-react/lib/providers/MeetingProvider/types';
import meetingConfig from '../../meetingConfig';
import { useLocation } from "react-router-dom";

const MeetingForm: React.FC = () => {
  const meetingManager = useMeetingManager();
  const {
    meetingId,
    localUserName,
    meetingMode,
    enableSimulcast,
    priorityBasedPolicy,
    keepLastFrameWhenPaused,
    isWebAudioEnabled,
    setJoinInfo,
    isEchoReductionEnabled,
    setMeetingMode,
    setMeetingId,
    setLocalUserName,
    setRegion,
    skipDeviceSelection,
  } = useAppState();
  const [meetingErr, setMeetingErr] = useState(false);
  const [nameErr, setNameErr] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());
  const navigate = useNavigate();
  const location = useLocation();

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = meetingId.trim().toLocaleLowerCase();
    const attendeeName = localUserName.trim();

    if (!id || !attendeeName) {
      if (!attendeeName) {
        setNameErr(true);
      }

      if (!id) {
        setMeetingErr(true);
      }

      return;
    }

    setIsLoading(true);
    meetingManager.getAttendee = createGetAttendeeCallback(id);

    try {
      // http://127.0.0.1:9000/?meetingId=test
      const queryParams = new URLSearchParams(location.search);
      setMeetingId(queryParams.get('meetingId') || '');

      const region = 'ap-northeast-1';
      const { JoinInfo } = await createMeetingAndAttendee(id, attendeeName, region, isEchoReductionEnabled);
      setJoinInfo(JoinInfo);
      const meetingSessionConfiguration = new MeetingSessionConfiguration(JoinInfo?.Meeting, JoinInfo?.Attendee);
      if (
        meetingConfig.postLogger &&
        meetingSessionConfiguration.meetingId &&
        meetingSessionConfiguration.credentials &&
        meetingSessionConfiguration.credentials.attendeeId
      ) {
        const existingMetadata = meetingConfig.postLogger.metadata;
        meetingConfig.postLogger.metadata = {
          ...existingMetadata,
          meetingId: meetingSessionConfiguration.meetingId,
          attendeeId: meetingSessionConfiguration.credentials.attendeeId,
        };
      }

      setRegion(JoinInfo.Meeting.MediaRegion);
      meetingSessionConfiguration.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = enableSimulcast;
      if (priorityBasedPolicy) {
        meetingSessionConfiguration.videoDownlinkBandwidthPolicy = priorityBasedPolicy;
      }
      meetingSessionConfiguration.keepLastFrameWhenPaused = keepLastFrameWhenPaused;
      const options: MeetingManagerJoinOptions = {
        deviceLabels: meetingMode === MeetingMode.Spectator ? DeviceLabels.None : DeviceLabels.AudioAndVideo,
        enableWebAudio: isWebAudioEnabled,
        skipDeviceSelection,
      };

      await meetingManager.join(meetingSessionConfiguration, options);
      if (meetingMode === MeetingMode.Spectator) {
        await meetingManager.start();
        navigate(`${routes.MEETING}/${meetingId}`);
      } else {
        setMeetingMode(MeetingMode.Attendee);
        navigate(routes.DEVICE);
      }
    } catch (error) {
      updateErrorMessage((error as Error).message);
    }
  };

  const closeError = (): void => {
    updateErrorMessage('');
    setMeetingId('');
    setLocalUserName('');
    setIsLoading(false);
  };

  return (
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem">
        会議に参加する
      </Heading>
      <FormField
        field={Input}
        label="会議ID"
        value={meetingId}
        // infoText="Anyone with access to the meeting ID can join"
        fieldProps={{
          name: 'meetingId',
          placeholder: '会議IDを入力してください',
        }}
        errorText="Please enter a valid meeting ID"
        error={meetingErr}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
          setMeetingId(e.target.value);
          if (meetingErr) {
            setMeetingErr(false);
          }
        }}
      />
      <FormField
        field={Input}
        label="名前"
        value={localUserName}
        fieldProps={{
          name: 'name',
          placeholder: '名前を入力してください',
        }}
        errorText="Please enter a valid name"
        error={nameErr}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
          setLocalUserName(e.target.value);
          if (nameErr) {
            setNameErr(false);
          }
        }}
      />
      <Flex container layout="fill-space-centered" style={{ marginTop: '2.5rem' }}>
        {isLoading ? <Spinner /> : <PrimaryButton label="続ける" onClick={handleJoinMeeting} />}
      </Flex>
      {errorMessage && (
        <Modal size="md" onClose={closeError}>
          <ModalHeader title={`Meeting ID: ${meetingId}`} />
          <ModalBody>
            <Card
              title="会議に参加できませんでした"
              description="There was an issue finding that meeting. The meeting may have already ended, or your authorization may have expired."
              smallText={errorMessage}
            />
          </ModalBody>
        </Modal>
      )}
      <DevicePermissionPrompt />
    </form>
  );
};

export default MeetingForm;
