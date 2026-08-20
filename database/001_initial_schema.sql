CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE agency (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    timezone TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE department (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    name TEXT NOT NULL,
    discipline TEXT NOT NULL,
    UNIQUE (agency_id, name),
    UNIQUE (id, agency_id)
);

CREATE TABLE responder (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    display_name TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (id, agency_id)
);

CREATE TABLE unit (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    department_id UUID NOT NULL,
    call_sign TEXT NOT NULL,
    unit_kind TEXT NOT NULL,
    canonical_status TEXT NOT NULL,
    current_position geography(POINT, 4326),
    position_recorded_at TIMESTAMPTZ,
    UNIQUE (agency_id, call_sign),
    UNIQUE (id, agency_id),
    FOREIGN KEY (department_id, agency_id) REFERENCES department(id, agency_id)
);

CREATE TABLE equipment (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    department_id UUID,
    assigned_unit_id UUID,
    name TEXT NOT NULL,
    equipment_kind TEXT NOT NULL,
    asset_tag TEXT,
    operational BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (id, agency_id),
    FOREIGN KEY (department_id, agency_id) REFERENCES department(id, agency_id),
    FOREIGN KEY (assigned_unit_id, agency_id) REFERENCES unit(id, agency_id)
);

CREATE TABLE unit_staffing (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    unit_id UUID NOT NULL,
    responder_id UUID NOT NULL,
    staffing_role TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    FOREIGN KEY (unit_id, agency_id) REFERENCES unit(id, agency_id),
    FOREIGN KEY (responder_id, agency_id) REFERENCES responder(id, agency_id)
);

CREATE TABLE incident (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    incident_number TEXT NOT NULL,
    incident_type TEXT NOT NULL,
    priority SMALLINT NOT NULL CHECK (priority BETWEEN 1 AND 9),
    state TEXT NOT NULL,
    address TEXT NOT NULL,
    location geography(POINT, 4326) NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ,
    UNIQUE (agency_id, incident_number),
    UNIQUE (id, agency_id)
);

CREATE TABLE incident_assignment (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    incident_id UUID NOT NULL,
    unit_id UUID,
    responder_id UUID,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    cleared_at TIMESTAMPTZ,
    CHECK (unit_id IS NOT NULL OR responder_id IS NOT NULL),
    FOREIGN KEY (incident_id, agency_id) REFERENCES incident(id, agency_id),
    FOREIGN KEY (unit_id, agency_id) REFERENCES unit(id, agency_id),
    FOREIGN KEY (responder_id, agency_id) REFERENCES responder(id, agency_id)
);

CREATE TABLE command_group (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    incident_id UUID NOT NULL,
    parent_group_id UUID,
    group_kind TEXT NOT NULL,
    name TEXT NOT NULL,
    commander_responder_id UUID,
    UNIQUE (id, agency_id),
    FOREIGN KEY (incident_id, agency_id) REFERENCES incident(id, agency_id),
    FOREIGN KEY (parent_group_id, agency_id) REFERENCES command_group(id, agency_id),
    FOREIGN KEY (commander_responder_id, agency_id) REFERENCES responder(id, agency_id)
);

CREATE TABLE incident_task (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    incident_id UUID NOT NULL,
    command_group_id UUID,
    assigned_unit_id UUID,
    title TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    FOREIGN KEY (incident_id, agency_id) REFERENCES incident(id, agency_id),
    FOREIGN KEY (command_group_id, agency_id) REFERENCES command_group(id, agency_id),
    FOREIGN KEY (assigned_unit_id, agency_id) REFERENCES unit(id, agency_id)
);

CREATE TABLE radio_channel (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    name TEXT NOT NULL,
    rx_frequency_mhz NUMERIC(9, 5),
    tx_frequency_mhz NUMERIC(9, 5),
    talkgroup TEXT,
    notes TEXT NOT NULL DEFAULT '',
    UNIQUE (agency_id, name),
    UNIQUE (id, agency_id)
);

CREATE TABLE incident_radio_assignment (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    incident_id UUID NOT NULL,
    command_group_id UUID,
    radio_channel_id UUID NOT NULL,
    purpose TEXT NOT NULL,
    FOREIGN KEY (incident_id, agency_id) REFERENCES incident(id, agency_id),
    FOREIGN KEY (command_group_id, agency_id) REFERENCES command_group(id, agency_id),
    FOREIGN KEY (radio_channel_id, agency_id) REFERENCES radio_channel(id, agency_id)
);

CREATE TABLE incident_note (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    incident_id UUID NOT NULL,
    author_responder_id UUID,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    corrected_by_note_id UUID,
    UNIQUE (id, agency_id),
    FOREIGN KEY (incident_id, agency_id) REFERENCES incident(id, agency_id),
    FOREIGN KEY (author_responder_id, agency_id) REFERENCES responder(id, agency_id),
    FOREIGN KEY (corrected_by_note_id, agency_id) REFERENCES incident_note(id, agency_id)
);

CREATE TABLE conversation (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    scope TEXT NOT NULL,
    department_id UUID,
    incident_id UUID,
    command_group_id UUID,
    title TEXT NOT NULL,
    UNIQUE (id, agency_id),
    FOREIGN KEY (department_id, agency_id) REFERENCES department(id, agency_id),
    FOREIGN KEY (incident_id, agency_id) REFERENCES incident(id, agency_id),
    FOREIGN KEY (command_group_id, agency_id) REFERENCES command_group(id, agency_id)
);

CREATE TABLE message (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    conversation_id UUID NOT NULL,
    sender_responder_id UUID,
    message_kind TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (conversation_id, agency_id) REFERENCES conversation(id, agency_id),
    FOREIGN KEY (sender_responder_id, agency_id) REFERENCES responder(id, agency_id)
);

CREATE TABLE status_event (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    unit_id UUID,
    responder_id UUID,
    incident_id UUID,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    position geography(POINT, 4326),
    CHECK (unit_id IS NOT NULL OR responder_id IS NOT NULL),
    FOREIGN KEY (unit_id, agency_id) REFERENCES unit(id, agency_id),
    FOREIGN KEY (responder_id, agency_id) REFERENCES responder(id, agency_id),
    FOREIGN KEY (incident_id, agency_id) REFERENCES incident(id, agency_id)
);

CREATE TABLE audit_event (
    id UUID PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agency(id),
    actor_id UUID,
    action TEXT NOT NULL,
    subject_type TEXT NOT NULL,
    subject_id UUID,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    details JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX incident_location_gix ON incident USING GIST (location);
CREATE INDEX unit_position_gix ON unit USING GIST (current_position);
CREATE INDEX status_event_subject_idx ON status_event (agency_id, unit_id, responder_id, recorded_at DESC);
CREATE INDEX audit_event_agency_time_idx ON audit_event (agency_id, occurred_at DESC);
CREATE INDEX assignment_incident_idx ON incident_assignment (agency_id, incident_id, cleared_at);
CREATE INDEX message_conversation_time_idx ON message (agency_id, conversation_id, created_at);
