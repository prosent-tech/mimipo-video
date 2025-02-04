// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const express = require('express');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');
const morganBody = require('morgan-body');
const bodyParser = require('body-parser');
const cors = require('cors');

const { ChimeSDKMediaPipelines } = require('@aws-sdk/client-chime-sdk-media-pipelines');
const { ChimeSDKMeetings } = require('@aws-sdk/client-chime-sdk-meetings');
const { STS } = require('@aws-sdk/client-sts');

const port = 8080;
const region = 'ap-northeast-1';

const app = express();

const corsOptions = {
  origin: '*',
  methods: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(bodyParser.json());
morganBody(app);

const chimeSDKMediaPipelines = new ChimeSDKMediaPipelines({
  region: 'ap-northeast-1',
  endpoint: process.env.CHIME_SDK_MEDIA_PIPELINES_ENDPOINT || "https://media-pipelines-chime.ap-northeast-1.amazonaws.com" });
const chimeSDKMeetings = new ChimeSDKMeetings({ region });
const sts = new STS({ region: 'ap-northeast-1' });

const captureS3Destination = process.env.CAPTURE_S3_DESTINATION;

const meetingCache = {};
const attendeeCache = {};
const captureCache = {};

app.post('/meetings', async (req, res) => {
  try {
    const { title, region = 'ap-northeast-1', ns_es } = req.body;
    if (!meetingCache[title]) {
      const { Meeting } = await chimeSDKMeetings.createMeeting({
        ClientRequestToken: uuidv4(),
        MediaRegion: region,
        ExternalMeetingId: title.substring(0, 64),
        MeetingFeatures: ns_es === 'true' ? { Audio: { EchoReduction: 'AVAILABLE' } } : undefined,
      });

      meetingCache[title] = Meeting;
      attendeeCache[title] = {};
    }

    const joinInfo = {
      JoinInfo: {
        Title: title,
        Meeting: meetingCache[title],
      },
    };

    res.status(201).json(joinInfo);
  } catch (err) {
    console.error(`Error creating meeting: ${err}`);
    res.status(500).json({ error: err.message });
  }
});

app.post('/join', async (req, res) => {
  try {
    const { title, attendeeName, region = 'ap-northeast-1', ns_es } = req.body;

    if (!meetingCache[title]) {
      const { Meeting } = await chimeSDKMeetings.createMeeting({
        ClientRequestToken: uuidv4(),
        MediaRegion: region,
        ExternalMeetingId: title.substring(0, 64),
        MeetingFeatures: ns_es === 'true' ? { Audio: { EchoReduction: 'AVAILABLE' } } : undefined,
      });

      meetingCache[title] = Meeting;
      attendeeCache[title] = {};
    }

    const { Attendee } = await chimeSDKMeetings.createAttendee({
      MeetingId: meetingCache[title].MeetingId,
      ExternalUserId: uuidv4(),
    });

    attendeeCache[title][Attendee.AttendeeId] = { ...Attendee, Name: attendeeName };

    const joinInfo = {
      JoinInfo: {
        Title: title,
        Meeting: meetingCache[title],
        Attendee: attendeeCache[title][Attendee.AttendeeId],
      },
    };

    res.status(201).json(joinInfo);
  } catch (err) {
    console.error(`Error creating/joining meeting: ${err}`);
    res.status(403).json({ error: err.message });
  }
});

app.get('/attendee', (req, res) => {
  try {
    const { title, attendeeId } = req.query;
    const attendee = attendeeCache[title][attendeeId];
    res.status(200).json(attendee);
  } catch (err) {
    console.error(`Error getting attendee information: ${err}`);
    res.status(403).json({ error: err.message });
  }
});

app.post('/end', async (req, res) => {
  try {
    const { title } = req.body;

    await chimeSDKMeetings.deleteMeeting({
      MeetingId: meetingCache[title].MeetingId,
    });

    res.status(200).end();
  } catch (err) {
    console.error(`Error ending meeting: ${err}`);
    res.status(403).json({ error: err.message });
  }
});

app.post('/startCapture', async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!captureS3Destination) {
      console.warn('Cloud media capture not available - S3 destination not configured');
      return res.status(500).json({ error: 'Cloud media capture not configured' });
    }

    console.log(meetingCache);
    if (!meetingCache[title]) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const callerInfo = await sts.getCallerIdentity({});
    
    const pipelineInfo = await chimeSDKMediaPipelines.createMediaCapturePipeline({
      SourceType: "ChimeSdkMeeting",
      SourceArn: `arn:aws:chime::${callerInfo.Account}:meeting:${meetingCache[title].MeetingId}`,
      SinkType: "S3Bucket",
      SinkArn: captureS3Destination
    });

    console.log(pipelineInfo);

    captureCache[title] = pipelineInfo.MediaCapturePipeline;

    res.status(201).json(pipelineInfo);
  } catch (err) {
    console.error(`Error starting capture: ${err}`);
    res.status(500).json({ error: err.message });
  }
});

app.post('/endCapture', async (req, res) => {
  try {
    const { title } = req.query;

    if (!captureS3Destination) {
      console.warn('Cloud media capture not available - S3 destination not configured');
      return res.status(500).json({ error: 'Cloud media capture not configured' });
    }

    if (!captureCache[title]) {
      return res.status(404).json({ error: 'No active capture found for meeting' });
    }

    // Delete the media capture pipeline
    await chimeSDKMediaPipelines.deleteMediaCapturePipeline({
      MediaPipelineId: captureCache[title].MediaPipelineId
    });

    // Remove from cache
    delete captureCache[title];

    res.status(200).json({});
  } catch (err) {
    console.error(`Error ending capture: ${err}`);
    res.status(500).json({ error: err.message });
  }
});

// Route to receive logs
app.post('/logs', (req, res) => {
  console.log('Received logs in the local server');
  res.end('Received logs in the local server');
});

// Handle unsupported requests
app.all('*', (req, res) => {
  res.status(400).json({ error: 'Bad Request - Unsupported Endpoint' });
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
