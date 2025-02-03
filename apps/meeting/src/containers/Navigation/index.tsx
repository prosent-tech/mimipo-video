// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import {
  Navbar,
  NavbarHeader,
  NavbarItem,
  Attendees,
  Flex,
  ZoomIn,
  ZoomOut,
  useContentShareState,
  Chat,
} from 'amazon-chime-sdk-component-library-react';

import { useNavigation } from '../../providers/NavigationProvider';
import { useAppState } from '../../providers/AppStateProvider';
import { Layout } from '../../types';
import GalleryLayout from '../../components/icons/GalleryLayout';
import FeaturedLayout from '../../components/icons/FeaturedLayout';
import { useVideoTileGridControl } from '../../providers/VideoTileGridProvider';

const Navigation: React.FC = () => {
  const { toggleRoster, closeNavbar, toggleChat } = useNavigation();
  const { layout, setLayout, priorityBasedPolicy } = useAppState();
  const { sharingAttendeeId } = useContentShareState();
  const { zoomIn, zoomOut } = useVideoTileGridControl();

  return (
    <Navbar className="nav" flexDirection="column" container>
      <NavbarHeader title="ナビゲーション" onClose={closeNavbar} />
      <Flex css="margin-top: 0rem;">
        <NavbarItem
          icon={<Attendees />}
          onClick={toggleRoster}
          label="参加者"
        />
        <NavbarItem
          icon={<Chat />}
          onClick={toggleChat}
          label="チャット"
        />
        <NavbarItem
          icon={
            layout === Layout.Gallery ? (
              <FeaturedLayout />
            ) : (
              <GalleryLayout />
            )
          }
          onClick={(): void => {
            if (layout === Layout.Gallery) {
              setLayout(Layout.Featured);
            } else {
              setLayout(Layout.Gallery);
            }
          }}
          disabled={!!sharingAttendeeId}
          label="表示を変更する"
        />
        {layout === Layout.Gallery && priorityBasedPolicy &&
          <>
            <NavbarItem
              icon={<ZoomIn />}
              onClick={zoomIn}
              label="Zoom In"
              disabled={!!sharingAttendeeId}
            />
            <NavbarItem
              icon={<ZoomOut />}
              onClick={zoomOut}
              label="Zoom Out"
            />
          </>
        }
      </Flex>
    </Navbar>
  );
};

export default Navigation;
