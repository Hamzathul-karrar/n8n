import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Button, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import MonacoEditor from '@monaco-editor/react';
import BaseNode from './BaseNode';

export default function CodeNode({ data, id }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jsCode, setJsCode] = useState(`const data = $input.first().json.data;
const regex = /https:\\/\\/[\\s"]+/g;
let urls = data.match(regex) || [];
return urls.map(url => {
  const domainMatch = url.match(/https:\\/\\/[\\/]+/);
  const domain = domainMatch ? domainMatch[0] : url;
  return { json: { url: domain } };
});`);

  const handleCodeChange = (value) => {
    setJsCode(value);
  };

  return (
    <>
      <BaseNode 
        data={data} 
        id={id}
        onDoubleClick={() => setIsDialogOpen(true)}
      >
        <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
          Code Node
        </Typography>
      </BaseNode>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth={false}
        PaperProps={{
          style: { backgroundColor: '#2a2a2a', color: '#fff', width: '40%', borderRadius: '8px', padding: '16px' }
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #444',
            padding: '16px',
            '& .MuiTypography-root': {
              fontSize: '1.5rem',
              fontWeight: 600
            }
          }}
        >
          Code
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <FormControl fullWidth margin="normal" sx={{ mt: 3 }}>
            <InputLabel
              id="language-label"
              sx={{
                color: '#888',
                '&.Mui-focused': { color: '#ff6d5a' }
              }}
            >
              Language
            </InputLabel>
            <Select
              labelId="language-label"
              value="Code"
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff6d5a' }
              }}
            >
              <MenuItem value="Code">JavaScript</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ height: '400px', border: '1px solid #444', borderRadius: '4px', mt: 3 }}>
            <MonacoEditor
              height="400px"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={jsCode}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBars: 'vertical',
                automaticLayout: true
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setIsDialogOpen(false)}
              sx={{
                color: '#fff',
                borderColor: '#666',
                '&:hover': { borderColor: '#888' }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsDialogOpen(false)}
              sx={{
                backgroundColor: '#ff6d5a',
                '&:hover': { backgroundColor: '#ff8d7a' }
              }}
            >
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

CodeNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
  }).isRequired,
  id: PropTypes.string.isRequired,
}; 