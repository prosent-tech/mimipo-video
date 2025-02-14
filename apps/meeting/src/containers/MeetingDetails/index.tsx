// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import { Flex } from 'amazon-chime-sdk-component-library-react';

const MeetingDetails = () => {
  return (
    <Flex container layout="fill-space-centered">
      <Flex mb="2rem" mr={{ md: '2rem' }} px="1rem">
        <span style={{ fontSize: '16px', lineHeight: '1.5' }}>
          ＊別の診察状況により医師またはカウンセラーの入室が遅れる可能性がございます。
          ご入室のままでお待ち下さい。診察予約時間から5分以上経っても入室がない場合はLINEまでご連絡いただけますと幸いです。
        </span>
      </Flex>
    </Flex>
  );
};

export default MeetingDetails;
