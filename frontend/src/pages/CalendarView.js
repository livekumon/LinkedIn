import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Schedule,
  Close,
  CalendarMonth,
  Edit,
  Delete,
} from '@mui/icons-material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '../styles/calendar.css';
import MainLayout from '../components/Layout/MainLayout';
import { ideaAPI } from '../services/ideaService';
import { geminiAPI } from '../services/geminiService';
import { 
  convertUTCToUserTimezone, 
  convertUserTimezoneToUTC,
  formatTimeLocale,
  getCurrentTimeInUserTimezone 
} from '../utils/timezoneUtils';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const CalendarView = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState(null);
  const [articleContent, setArticleContent] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userTimezone, setUserTimezone] = useState(() => {
    return localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    // Listen for timezone changes
    const handleTimezoneChange = () => {
      const newTimezone = localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(newTimezone);
      fetchIdeas(); // Refresh to update times
    };

    window.addEventListener('timezonechange', handleTimezoneChange);
    return () => window.removeEventListener('timezonechange', handleTimezoneChange);
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const response = await ideaAPI.getAllIdeas();
      const allIdeas = response.data.data.ideas;
      // Get scheduled and posted ideas
      const relevantIdeas = allIdeas.filter(
        idea => (idea.status === 'scheduled' || idea.status === 'posted') && idea.scheduledFor
      );
      setIdeas(relevantIdeas);
    } catch (err) {
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  // Convert ideas to calendar events
  const events = useMemo(() => {
    return ideas.map(idea => {
      const startTime = convertUTCToUserTimezone(idea.scheduledFor, userTimezone);
      
      return {
        id: idea._id,
        title: idea.title,
        start: startTime.toDate(),
        end: startTime.add(1, 'hour').toDate(), // 1 hour duration
        resource: idea,
      };
    });
  }, [ideas, userTimezone]);

  const fetchArticleContent = async (ideaId) => {
    setLoadingArticle(true);
    try {
      const response = await geminiAPI.getArticleVersions(ideaId);
      const versions = response.data.data.versions;
      
      if (versions && versions.length > 0) {
        // Get the latest version
        const latestVersion = versions[0];
        setArticleContent(latestVersion.content);
      } else {
        setArticleContent(null);
      }
    } catch (err) {
      console.error('Failed to fetch article:', err);
      setArticleContent(null);
    } finally {
      setLoadingArticle(false);
    }
  };

  const handleSelectEvent = async (event) => {
    setSelectedEvent(event);
    setArticleContent(null);
    setEventDialogOpen(true);
    
    // Fetch article content
    await fetchArticleContent(event.resource._id);
  };

  const handleCloseEventDialog = () => {
    setEventDialogOpen(false);
    setSelectedEvent(null);
    setArticleContent(null);
  };

  const handleEditSchedule = () => {
    const idea = selectedEvent.resource;
    const timeInUserTz = convertUTCToUserTimezone(idea.scheduledFor, userTimezone);
    setScheduledDateTime(timeInUserTz);
    setEventDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setScheduledDateTime(null);
    setSelectedEvent(null);
  };

  const handleSaveSchedule = async () => {
    if (!selectedEvent || !scheduledDateTime) return;
    
    try {
      const utcTime = convertUserTimezoneToUTC(scheduledDateTime, userTimezone);
      
      await ideaAPI.updateIdea(selectedEvent.resource._id, { 
        scheduledFor: utcTime,
        status: 'scheduled'
      });
      
      setSuccess('Schedule updated successfully');
      await fetchIdeas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update schedule');
      setTimeout(() => setError(''), 3000);
    } finally {
      handleCloseEditDialog();
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedEvent) return;
    
    if (window.confirm('Are you sure you want to remove this schedule?')) {
      try {
        await ideaAPI.updateIdea(selectedEvent.resource._id, { 
          scheduledFor: null,
          status: 'ai_generated'
        });
        
        setSuccess('Schedule removed');
        await fetchIdeas();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to remove schedule');
        setTimeout(() => setError(''), 3000);
      } finally {
        handleCloseEventDialog();
      }
    }
  };

  // Handle drag and drop
  const handleEventDrop = async ({ event, start, end }) => {
    try {
      // Only allow dragging scheduled posts (double-check)
      if (event.resource.status !== 'scheduled') {
        setError('Only scheduled posts can be rescheduled. Posted content cannot be moved.');
        setTimeout(() => setError(''), 4000);
        await fetchIdeas();
        return;
      }
      
      // Check if the new time is in the past
      const now = new Date();
      if (start < now) {
        setError('Cannot schedule in the past. Please select a future date and time.');
        setTimeout(() => setError(''), 4000);
        // Refresh to reset the UI
        await fetchIdeas();
        return;
      }
      
      // Convert the new start time to UTC
      // The 'start' parameter is a Date object in browser's local timezone
      const utcTime = start.toISOString();
      
      console.log('Drag & Drop Update:');
      console.log('- Event ID:', event.resource._id);
      console.log('- Event Title:', event.resource.title);
      console.log('- Original scheduled time (UTC):', event.resource.scheduledFor);
      console.log('- Original in user TZ:', formatTimeLocale(event.resource.scheduledFor, userTimezone));
      console.log('- New dropped time (browser local):', start.toLocaleString());
      console.log('- New time in UTC to save:', utcTime);
      console.log('- New time in user TZ:', formatTimeLocale(utcTime, userTimezone));
      
      await ideaAPI.updateIdea(event.resource._id, { 
        scheduledFor: utcTime,
        status: 'scheduled'
      });
      
      setSuccess(`Schedule updated to ${formatTimeLocale(utcTime, userTimezone)}`);
      await fetchIdeas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Drag update error:', err);
      setError('Failed to update schedule');
      setTimeout(() => setError(''), 3000);
      await fetchIdeas(); // Refresh on error to reset position
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    // Handle resize if needed (currently not used, but kept for future)
    await handleEventDrop({ event, start, end });
  };

  // Handle clicking on a date/slot to navigate to day view
  const handleNavigate = (newDate, view, action) => {
    setCurrentDate(newDate);
  };

  const handleSelectSlot = (slotInfo) => {
    // When clicking on a date in month view, switch to day view for that date
    if (currentView === 'month' && slotInfo.action === 'click') {
      setCurrentDate(slotInfo.start);
      setCurrentView('day');
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Custom event style getter
  const eventStyleGetter = (event) => {
    const idea = event.resource;
    let backgroundColor = '#0077B5'; // Default blue for scheduled
    let border = '0';
    
    if (idea.status === 'posted') {
      backgroundColor = '#2e7d32'; // Green for posted
      border = '2px solid #1b5e20'; // Darker green border to show it's locked
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border,
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 5px',
        cursor: idea.status === 'scheduled' ? 'move' : 'pointer',
        fontWeight: idea.status === 'posted' ? 600 : 500,
      }
    };
  };

  // Custom event component with tooltip
  const CustomEvent = ({ event }) => {
    return (
      <Box
        sx={{
          height: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={event.resource.content}
      >
        {event.title}
      </Box>
    );
  };

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Calendar View
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentView === 'month' && 'View all your scheduled and posted ideas'}
                {currentView === 'week' && 'Week view - See events by hour'}
                {currentView === 'day' && `Day view - ${currentDate.toLocaleDateString()} - Drag events to change time`}
                {currentView === 'agenda' && 'Agenda view - List of all events'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={`${ideas.filter(i => i.status === 'scheduled').length} Scheduled`}
                color="primary"
                size="small"
              />
              <Chip 
                label={`${ideas.filter(i => i.status === 'posted').length} Posted`}
                color="success"
                size="small"
              />
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>How to use:</strong> Click on a date to open day view • Hover over events to see idea text • Click events to view full article • Drag scheduled posts to reschedule (only to current or future dates)
            </Typography>
          </Alert>
          
          {currentView === 'day' && (
            <Alert severity="success" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Day View:</strong> You're now in day view - drag scheduled events up or down to change their time. Click "Month" to go back.
              </Typography>
            </Alert>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Box sx={{ height: currentView === 'month' ? 600 : 700 }}>
                <DnDCalendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  view={currentView}
                  date={currentDate}
                  onView={handleViewChange}
                  onNavigate={handleNavigate}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  views={['month', 'week', 'day', 'agenda']}
                  popup
                  tooltipAccessor={(event) => event.resource.content}
                  draggableAccessor={(event) => event.resource.status === 'scheduled'}
                  resizable={false}
                  onEventDrop={handleEventDrop}
                  onEventResize={handleEventResize}
                  step={15}
                  timeslots={4}
                  defaultDate={currentDate}
                  scrollToTime={new Date()}
                  components={{
                    event: CustomEvent,
                  }}
                />
              </Box>
              
              {/* Legend */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    bgcolor: '#0077B5', 
                    borderRadius: 1,
                    cursor: 'move',
                  }} />
                  <Typography variant="caption">Scheduled (Draggable)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    bgcolor: '#2e7d32', 
                    borderRadius: 1,
                    border: '2px solid #1b5e20',
                  }} />
                  <Typography variant="caption">Posted (View Only)</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Event Details Dialog */}
        <Dialog
          open={eventDialogOpen}
          onClose={handleCloseEventDialog}
          maxWidth="sm"
          fullWidth
        >
          {selectedEvent && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonth color="primary" />
                    <Typography variant="h6">Post Details</Typography>
                  </Box>
                  <IconButton onClick={handleCloseEventDialog} size="small">
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={selectedEvent.resource.status === 'posted' ? 'Posted' : 'Scheduled'}
                    color={selectedEvent.resource.status === 'posted' ? 'success' : 'primary'}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ORIGINAL IDEA
                  </Typography>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'action.hover', 
                    borderRadius: 1, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    mb: 2 
                  }}>
                    <Typography variant="body2">
                      {selectedEvent.resource.content}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {selectedEvent.resource.status === 'posted' ? 'POSTED ARTICLE' : 'SCHEDULED ARTICLE'}
                  </Typography>
                  
                  {loadingArticle ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : articleContent ? (
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      maxHeight: 300,
                      overflow: 'auto',
                      mb: 2
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6 
                        }}
                      >
                        {articleContent}
                      </Typography>
                    </Box>
                  ) : (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      No AI-generated article found for this idea. Please generate an article first from the Ideas page.
                    </Alert>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {selectedEvent.resource.status === 'posted' ? 'POSTED TIME' : 'SCHEDULED TIME'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule fontSize="small" color="primary" />
                    <Typography variant="body2">
                      {formatTimeLocale(selectedEvent.resource.scheduledFor, userTimezone)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Timezone: {userTimezone}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                {selectedEvent.resource.status === 'scheduled' && (
                  <>
                    <Button
                      color="error"
                      onClick={handleDeleteSchedule}
                      startIcon={<Delete />}
                    >
                      Remove Schedule
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleEditSchedule}
                      startIcon={<Edit />}
                    >
                      Edit Schedule
                    </Button>
                  </>
                )}
                {selectedEvent.resource.status === 'posted' && (
                  <Button variant="outlined" onClick={handleCloseEventDialog}>
                    Close
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Edit Schedule Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule color="primary" />
              <Typography variant="h6">Edit Schedule</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Scheduled Date & Time"
                value={scheduledDateTime}
                onChange={(newValue) => setScheduledDateTime(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    helperText: `Time zone: ${userTimezone}`,
                  }
                }}
                minDateTime={getCurrentTimeInUserTimezone(userTimezone)}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseEditDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSaveSchedule}
              variant="contained"
              disabled={!scheduledDateTime}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default CalendarView;

