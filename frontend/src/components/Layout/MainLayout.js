import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem, 
  Typography, 
  Chip, 
  IconButton, 
  AppBar, 
  Toolbar,
  useMediaQuery,
  useTheme,
  Divider,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import { 
  LinkedIn, 
  ExpandMore, 
  Menu as MenuIcon, 
  LightbulbOutlined,
  DashboardOutlined,
  StarOutline,
  LogoutOutlined,
  Delete,
  Brightness4,
  Brightness7,
  CardMembership,
} from '@mui/icons-material';
import LinkedInConnectModal from '../LinkedInConnectModal';
import { linkedInAPI } from '../../services/linkedInService';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';

const MainLayout = ({ children }) => {
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [linkedInMenuAnchorEl, setLinkedInMenuAnchorEl] = useState(null);
  const [navMenuAnchorEl, setNavMenuAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardOutlined />, path: '/dashboard' },
    { text: 'Ideas', icon: <LightbulbOutlined />, path: '/ideas' },
    { text: 'Favorites', icon: <StarOutline />, path: '/favorites' },
    { text: 'Subscriptions', icon: <CardMembership />, path: '/subscriptions' },
    { text: 'Recycle Bin', icon: <Delete />, path: '/recycle-bin' },
  ];

  // Get current page name based on route
  const getCurrentPageName = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem || { text: 'My Ideas', icon: <LightbulbOutlined /> };
  };

  const currentPage = getCurrentPageName();

  const handleNavMenuOpen = (event) => {
    setNavMenuAnchorEl(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    setNavMenuAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleNavMenuClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleNavMenuClose();
  };

  useEffect(() => {
    fetchConnectionStatus();
    
    // Check for OAuth callback success/error
    const params = new URLSearchParams(window.location.search);
    if (params.get('linkedin') === 'connected') {
      fetchConnectionStatus();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchConnectionStatus = async () => {
    try {
      const response = await linkedInAPI.getConnectionStatus();
      const { connected, connection } = response.data.data;
      setLinkedInConnected(connected);
      if (connected) {
        setLinkedInProfile(connection);
      }
    } catch (error) {
      console.error('Failed to fetch LinkedIn status:', error);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await linkedInAPI.getLinkedInAuthUrl();
      const { authUrl } = response.data.data;
      // Redirect to LinkedIn OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get LinkedIn auth URL:', error);
      throw error;
    }
  };

  const handleDisconnect = async () => {
    try {
      await linkedInAPI.disconnectLinkedIn();
      setLinkedInConnected(false);
      setLinkedInProfile(null);
      setLinkedInMenuAnchorEl(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleLinkedInMenuClick = (event) => {
    setLinkedInMenuAnchorEl(event.currentTarget);
  };

  const handleLinkedInMenuClose = () => {
    setLinkedInMenuAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', flexDirection: 'column' }}>
      {/* Top Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          {/* Hamburger Menu Button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleNavMenuOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Navigation Dropdown Menu */}
          <Menu
            anchorEl={navMenuAnchorEl}
            open={Boolean(navMenuAnchorEl)}
            onClose={handleNavMenuClose}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                minWidth: 250,
                mt: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }
            }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 2, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={user?.profilePicture}
                  alt={user?.name}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider />
            
            {/* Navigation Items */}
            {menuItems.map((item) => (
              <MenuItem 
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(0, 119, 181, 0.08)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 119, 181, 0.12)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 500,
                  }}
                />
              </MenuItem>
            ))}
            
            <Divider />
            
            {/* Logout */}
            <MenuItem 
              onClick={handleLogout}
              sx={{
                py: 1.5,
                color: 'error.main',
              }}
            >
              <ListItemIcon sx={{ color: 'error.main' }}>
                <LogoutOutlined />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </MenuItem>
          </Menu>

          <Typography 
            variant="h6" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {React.cloneElement(currentPage.icon, { sx: { color: 'primary.main' } })}
            {currentPage.text}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Theme Toggle Button */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              mr: 2,
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'background.default',
              },
            }}
            title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>

          {/* LinkedIn Connection */}
          {linkedInConnected && linkedInProfile ? (
            <>
              <Button
                onClick={handleLinkedInMenuClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 0.5, sm: 1 },
                  px: { xs: 1, sm: 2 },
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'background.default',
                  },
                }}
              >
                <LinkedIn sx={{ color: '#0077B5', fontSize: { xs: 20, sm: 24 } }} />
                <Typography 
                  variant="body2" 
                  fontWeight={500}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  {linkedInProfile.firstName} {linkedInProfile.lastName}
                </Typography>
                <Chip label="Connected" size="small" color="success" />
                <ExpandMore sx={{ display: { xs: 'none', sm: 'block' } }} />
              </Button>
              <Menu
                anchorEl={linkedInMenuAnchorEl}
                open={Boolean(linkedInMenuAnchorEl)}
                onClose={handleLinkedInMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<LinkedIn />}
              onClick={() => setModalOpen(true)}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                borderColor: '#0077B5',
                color: '#0077B5',
                fontWeight: 600,
                px: { xs: 2, sm: 3 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                '&:hover': {
                  borderColor: '#0077B5',
                  bgcolor: 'rgba(0, 119, 181, 0.04)',
                },
              }}
            >
              {isMobile ? 'LinkedIn' : 'Connect to LinkedIn'}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: { xs: 1.5, sm: 2 }, flexGrow: 1, overflow: 'auto' }}>
        {children}
      </Box>

      <LinkedInConnectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnect={handleConnect}
      />
    </Box>
  );
};

export default MainLayout;

