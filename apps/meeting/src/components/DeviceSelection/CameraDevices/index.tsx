// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import {
  PreviewVideo,
  QualitySelection,
} from 'amazon-chime-sdk-component-library-react';

import { StyledInputGroup } from '../Styled';
import { useAppState } from '../../../providers/AppStateProvider';
import { VideoFiltersCpuUtilization } from '../../../types';
import { VideoTransformDropdown } from '../CameraDevices/VideoTransformDropdown';

const CameraDevices = () => {
  const { videoTransformCpuUtilization } = useAppState();
  const videoTransformsEnabled = videoTransformCpuUtilization !== VideoFiltersCpuUtilization.Disabled;
  return (
    <div>
      <StyledInputGroup>
        <QualitySelection label='品質' labelForUnselected='ビデオ品質を選択' />
      </StyledInputGroup>
      { videoTransformsEnabled ?
        <StyledInputGroup>
          <VideoTransformDropdown label='背景' />
        </StyledInputGroup> : ''
      }
      <PreviewVideo />
    </div>
  );
};

export default CameraDevices;
