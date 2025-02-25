import { ThemeProvider, createTheme } from '@mui/material';
import WorkflowEditor from './components/WorkflowEditor';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6d5a',
    },
    secondary: {
      main: '#444',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
    text: {
      primary: '#fff',
      secondary: '#bbb',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderColor: '#444',
          color: '#fff',
          '&:hover': {
            borderColor: '#666',
            backgroundColor: 'rgba(255, 109, 90, 0.08)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <WorkflowEditor />
      <ToastContainer position="bottom-right" theme="dark" />
    </ThemeProvider>
  );
}

export default App;
