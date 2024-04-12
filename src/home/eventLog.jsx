import React from 'react';

const EventLog = ({ events }) => {
    return (
        <div id="event-log">
            <h2>Event Log</h2>
            <div id="events">
                {events.map((event, index) => (
                    <div key={index} className="event">
                        <span className="event-action">
                            <span className="family-member">{event.familyMember}</span> completed:
                        </span>
                        <span className="task-name">{event.task}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default EventLog;
