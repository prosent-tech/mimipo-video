// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import {
  ControlBar,
  AudioInputVFControl,
  AudioInputControl,
  ContentShareControl,
  AudioOutputControl,
  ControlBarButton,
  useUserActivityState,
  Dots,
  VideoInputControl,
} from 'amazon-chime-sdk-component-library-react';

import EndMeetingControl from '../EndMeetingControl';
import { useNavigation } from '../../providers/NavigationProvider';
import { StyledControls } from './Styled';
import { useAppState } from '../../providers/AppStateProvider';
import { VideoFiltersCpuUtilization } from '../../types';
import VideoInputTransformControl from '../../components/MeetingControls/VideoInputTransformControl';

const MeetingControls: React.FC = () => {
  const { toggleNavbar, closeRoster, showRoster } = useNavigation();
  const { isUserActive } = useUserActivityState();
  const { isWebAudioEnabled, videoTransformCpuUtilization } = useAppState();
  const videoTransformsEnabled = videoTransformCpuUtilization !== VideoFiltersCpuUtilization.Disabled;

  const handleToggle = (): void => {
    if (showRoster) {
      closeRoster();
    }
    toggleNavbar();
  };

  return (
    <StyledControls className="controls" active={!!isUserActive}>
      <ControlBar
        className="controls-menu"
        layout="undocked-horizontal"
        showLabels={false}
      >
        <ControlBarButton
          className="mobile-toggle"
          icon={<Dots />}
          onClick={handleToggle}
          label=""
        />
        { isWebAudioEnabled ? <AudioInputVFControl muteLabel='' unmuteLabel='' /> :  <AudioInputControl muteLabel='' unmuteLabel='' /> }
        { videoTransformsEnabled ? <VideoInputTransformControl label='' backgroundBlurLabel='背景ぼかし' backgroundReplacementLabel='背景置換' /> : <VideoInputControl label='' /> }
        <ContentShareControl label='' />
        <AudioOutputControl label='' />
        <EndMeetingControl  />
      </ControlBar>
    </StyledControls>
  );
};

export default MeetingControls;
