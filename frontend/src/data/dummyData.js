import { todayString } from '../utils/helpers';


export const scheduleDummyData = [
  { id: 'demo-schedule-1', scene: 'Scene 12 - Café arrival', shootDate: '2026-11-01', startTime: '07:00', endTime: '10:00', location: 'Crescent Café', status: 'scheduled', notes: 'Morning setup.' },
  { id: 'demo-schedule-2', scene: 'Scene 18 - Rooftop talk', shootDate: '2026-11-02', startTime: '15:30', endTime: '18:30', location: 'Orchid Towers', status: 'in-progress', notes: 'Bring wind protection.' },
  { id: 'demo-schedule-3', scene: 'Scene 24 - Car exit', shootDate: '2026-11-03', startTime: '19:00', endTime: '22:00', location: 'East Coast Road', status: 'delayed', notes: 'Awaiting road permit.' },
];

export const taskDummyData = [
  { id: 'demo-task-1', title: 'Prepare camera kit', assignee: 'Arun Kumar', department: 'Camera', priority: 'high', dueDate: '2026-11-01', status: 'todo', description: 'Charge batteries and check lenses.' },
  { id: 'demo-task-2', title: 'Confirm costume changes', assignee: 'Meera S', department: 'Costume', priority: 'medium', dueDate: '2026-11-02', status: 'in-progress', description: 'Get actor approvals for scene 18.' },
  { id: 'demo-task-3', title: 'Share call sheet', assignee: 'Vijay R', department: 'Production', priority: 'low', dueDate: '2026-10-31', status: 'done', description: 'Send final version to all departments.' },
];

export const attendanceDummyData = () => {
  const date = todayString();
  return [
    { id: 'demo-attendance-1', crewMember: 'Arun Kumar', role: 'Camera Operator', date, status: 'present', checkIn: '06:45', checkOut: '18:30' },
    { id: 'demo-attendance-2', crewMember: 'Meera S', role: 'Costume Designer', date, status: 'late', checkIn: '08:20', checkOut: '18:00' },
    { id: 'demo-attendance-3', crewMember: 'Vijay R', role: 'Production Assistant', date, status: 'on-leave', checkIn: '', checkOut: '' },
  ];
};

export const callSheetDummyData = [
  { id: 'demo-call-sheet-1', title: 'Day 01 - Café', shootDate: '2026-11-01', generalCallTime: '06:30', location: 'Crescent Café', weather: 'Sunny, 29°C', scenes: 'Scenes 12, 13 and 14', notes: 'Park equipment at the rear entrance.' },
  { id: 'demo-call-sheet-2', title: 'Day 02 - Rooftop', shootDate: '2026-11-02', generalCallTime: '14:30', location: 'Orchid Towers', weather: 'Partly cloudy, 31°C', scenes: 'Scenes 18 and 19', notes: 'Safety briefing at 14:45.' },
  { id: 'demo-call-sheet-3', title: 'Day 03 - Highway', shootDate: '2026-11-03', generalCallTime: '17:30', location: 'East Coast Road', weather: 'Clear, 27°C', scenes: 'Scene 24', notes: 'Use the approved parking bay.' },
];

export const locationDummyData = [
  { id: 'demo-location-1', name: 'Crescent Café', address: '12 Cathedral Road, Chennai', contactPerson: 'Karthik', phone: '9876543210', permitNumber: 'CC-2026-101', permitStatus: 'approved', permitExpiry: '2026-12-31' },
  { id: 'demo-location-2', name: 'Orchid Towers', address: '45 OMR, Chennai', contactPerson: 'Nandhini', phone: '9876501234', permitNumber: 'OT-2026-084', permitStatus: 'pending', permitExpiry: '2026-11-05' },
  { id: 'demo-location-3', name: 'East Coast Road', address: 'ECR, Injambakkam, Chennai', contactPerson: 'Suresh', phone: '9876512345', permitNumber: 'ECR-2026-52', permitStatus: 'approved', permitExpiry: '2027-01-15' },
];
export const deliveryDummyData = [
  { id: 'demo-delivery-1', title: 'Final master - ProRes 4444', type: 'master', format: '4K UHD, 24fps', recipient: 'Sun NXT', dueDate: '2026-11-10', deliveredOn: '', status: 'in-progress', notes: 'Colour grade locked. Rendering in progress.' },
  { id: 'demo-delivery-2', title: 'English & Hindi subtitles', type: 'subtitles', format: 'SRT + IMSC', recipient: 'Prime Video', dueDate: '2026-10-25', deliveredOn: '', status: 'pending', notes: 'Translation review is still open.' },
  { id: 'demo-delivery-3', title: 'Audio stems 5.1', type: 'audio-stems', format: 'WAV 48kHz', recipient: 'Prime Video', dueDate: '2026-10-28', deliveredOn: '2026-10-27', status: 'delivered', notes: '' },
  { id: 'demo-delivery-4', title: 'Theatrical trailer', type: 'trailer', format: 'H.264 1080p', recipient: 'Marketing team', dueDate: '2026-11-05', deliveredOn: '', status: 'pending', notes: 'Waiting for final cut approval.' },
];

export const approvalDummyData = [
  { id: 'demo-approval-1', title: 'Final cut v7', type: 'final-cut', requestedBy: 'Vijay R', stage: 'producer', status: 'pending', remarks: '', requestedOn: '2026-10-27', decidedOn: '' },
  { id: 'demo-approval-2', title: 'Audio mix - reel 3', type: 'audio-mix', requestedBy: 'Meera S', stage: 'director', status: 'pending', remarks: '', requestedOn: '2026-10-29', decidedOn: '' },
  { id: 'demo-approval-3', title: 'Poster - key art', type: 'poster', requestedBy: 'Arun Kumar', stage: 'studio-head', status: 'approved', remarks: 'Looks good.', requestedOn: '2026-10-20', decidedOn: '2026-10-24' },
  { id: 'demo-approval-4', title: 'Subtitle timing - Tamil', type: 'subtitles', requestedBy: 'Vijay R', stage: 'director', status: 'rejected', remarks: 'Timing drifts after reel 2. Please re-sync.', requestedOn: '2026-10-22', decidedOn: '2026-10-23' },
];

export const notificationDummyData = [
  { id: 'demo-notification-1', title: 'Delivery overdue', message: 'English & Hindi subtitles for Prime Video were due on 25 Oct.', type: 'delivery', level: 'critical', read: false, createdAt: '2026-10-30T09:15:00' },
  { id: 'demo-notification-2', title: 'Approval needed', message: 'Final cut v7 is waiting for producer approval.', type: 'approval', level: 'warning', read: false, createdAt: '2026-10-29T17:40:00' },
  { id: 'demo-notification-3', title: 'OTT upload failed', message: 'The trailer upload to Aha failed. Retry from OTT Publishing.', type: 'ott', level: 'critical', read: false, createdAt: '2026-10-29T12:05:00' },
  { id: 'demo-notification-4', title: 'Audio stems delivered', message: 'Audio stems 5.1 reached Prime Video.', type: 'delivery', level: 'success', read: true, createdAt: '2026-10-27T18:20:00' },
];

export const ottDummyData = [
  { id: 'demo-ott-1', title: 'Kadalora Kadhai - Feature film', platform: 'Sun NXT', region: 'India', contentType: 'movie', releaseDate: '2026-11-20', publishedOn: '', status: 'scheduled', contentUrl: '', notes: 'Metadata and artwork uploaded.' },
  { id: 'demo-ott-2', title: 'Kadalora Kadhai - Trailer', platform: 'Aha', region: 'India', contentType: 'trailer', releaseDate: '2026-10-29', publishedOn: '', status: 'failed', contentUrl: '', notes: 'Rejected: audio loudness above spec.' },
  { id: 'demo-ott-3', title: 'Kadalora Kadhai - Feature film', platform: 'Prime Video', region: 'Global', contentType: 'movie', releaseDate: '2026-12-01', publishedOn: '', status: 'in-review', contentUrl: '', notes: 'Platform QC in progress.' },
  { id: 'demo-ott-4', title: 'Making of - Behind the scenes', platform: 'Disney+ Hotstar', region: 'India', contentType: 'short-film', releaseDate: '2026-10-15', publishedOn: '2026-10-15', status: 'published', contentUrl: 'https://example.com/watch/making-of', notes: '' },
];