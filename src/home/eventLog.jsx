import React from 'react';
import { handleApiError } from './../app';

const EventLog = () => {
    return (
        <div id="event-log">
            <h2>Event Log</h2>
            <div id="events">
                {/* Dynamically rendered event log entries */}
            </div>
        </div>
    );
};

export default EventLog;