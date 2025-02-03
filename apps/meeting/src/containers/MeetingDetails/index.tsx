// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import { Flex } from 'amazon-chime-sdk-component-library-react';

const MeetingDetails = () => {
  return (
    <Flex container layout="fill-space-centered">
      <Flex mb="2rem" mr={{ md: '2rem' }} px="1rem">
        {/* <Heading level={4} tag="h1" mb={2}>
          Mimipoオンラインクリニックへようこそ！
        </Heading> */}
      </Flex>
    </Flex>
  );
};

export default MeetingDetails;
