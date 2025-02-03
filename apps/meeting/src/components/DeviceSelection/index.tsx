// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import { StyledWrapper, StyledVideoGroup } from './Styled';
import CameraDevices from './CameraDevices';

const DeviceSelection = () => (
  <StyledWrapper>
    {/* <StyledAudioGroup>
      <MicrophoneDevices />
      <SpeakerDevices />
    </StyledAudioGroup> */}
    <StyledVideoGroup>
      <CameraDevices />
    </StyledVideoGroup>
  </StyledWrapper>
);

export default DeviceSelection;
