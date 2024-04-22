import React from 'react';
import { Box, Typography } from '@mui/material';

function ChatArea({ title, content }) {
    return (
        <Box width="48%">
            <Typography variant="h6">{title}</Typography>
            <Box p={2} border={1} borderRadius={2}>
                {content}
            </Box>
        </Box>
    );
}

export default ChatArea;
