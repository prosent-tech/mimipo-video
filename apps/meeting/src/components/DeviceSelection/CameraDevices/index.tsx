// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import {
  PreviewVideo,
  QualitySelection,
  Label,
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
      {/* <Heading tag="h2" level={6} css={title}>
        ビデオ
      </Heading> */}
      {/* <StyledInputGroup>
        <CameraSelection label='カメラソース' />
      </StyledInputGroup> */}
      <StyledInputGroup>
        <QualitySelection label='品質' labelForUnselected='ビデオ品質を選択' />
      </StyledInputGroup>
      { videoTransformsEnabled ?
        <StyledInputGroup>
          <VideoTransformDropdown label='背景' />
        </StyledInputGroup> : ''
      }
      <Label style={{ display: 'block', marginBottom: '.5rem' }}>
        プレビュー
      </Label>
      <PreviewVideo />
    </div>
  );
};

export default CameraDevices;
