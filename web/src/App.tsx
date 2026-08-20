import { FormEvent, useMemo, useState } from 'react'
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps'

type View = 'Dispatch' | 'Incidents' | 'Units' | 'Messages' | 'Administration'
type UnitStatus = 'AVAILABLE' | 'ASSIGNED' | 'RESPONDING' | 'ON_SCENE' | 'OUT_OF_SERVICE'
type IncidentState = 'Dispatched' | 'Active' | 'Controlled'

type Incident = { id: string; number: string; priority: number; type: string; address: string; age: string; summary: string; state: IncidentState; latitude: number; longitude: number; channel: string; notes: string[] }
type Unit = { callSign: string; kind: string; discipline: 'Law' | 'Fire' | 'EMS'; status: UnitStatus; latitude: number; longitude: number; incidentId?: string }
type Message = { id: number; sender: string; scope: string; body: string; time: string }
type CommandAssignment = { id: number; group: string; unit: string; task: string }

const initialIncidents: Incident[] = [
  { id: 'mvc', number: '26-000184', priority: 1, type: 'Motor vehicle collision', address: 'MO-5 & County Road 305', age: '12 min', state: 'Active', summary: 'Two vehicles, roadway partially blocked. Use caution on approach.', latitude: 36.9512, longitude: -92.6604, channel: 'TAC 2', notes: ['Two vehicles reported by county dispatch.', 'Medic 1 reports one patient requiring transport.'] },
  { id: 'breathing', number: '26-000185', priority: 2, type: 'Difficulty breathing', address: '410 Valley Street', age: '4 min', state: 'Dispatched', summary: 'Adult patient, conscious and breathing. Caller is at the front door.', latitude: 36.9631, longitude: -92.6659, channel: 'EMS OPS', notes: ['Medic 3 dispatched.'] },
]

const initialUnits: Unit[] = [
  { callSign: 'Medic 1', kind: 'Ambulance', discipline: 'EMS', status: 'ON_SCENE', latitude: 36.9513, longitude: -92.6602, incidentId: 'mvc' },
  { callSign: 'Engine 2', kind: 'Engine', discipline: 'Fire', status: 'RESPONDING', latitude: 36.9601, longitude: -92.672, incidentId: 'mvc' },
  { callSign: 'Medic 3', kind: 'Ambulance', discipline: 'EMS', status: 'RESPONDING', latitude: 36.971, longitude: -92.658, incidentId: 'breathing' },
  { callSign: 'Car 12', kind: 'Patrol', discipline: 'Law', status: 'AVAILABLE', latitude: 36.973, longitude: -92.6531 },
  { callSign: 'Rescue 4', kind: 'Rescue', discipline: 'Fire', status: 'OUT_OF_SERVICE', latitude: 36.955, longitude: -92.649 },
]

const initialMessages: Message[] = [
  { id: 1, sender: 'Dispatch', scope: 'All departments', body: 'Training mode is active. All information shown is simulated.', time: '22:40' },
  { id: 2, sender: 'Chief 1', scope: 'Incident 26-000184', body: 'Establishing command on TAC 2.', time: '22:43' },
]

const statusLabel = (status: UnitStatus) => status.replaceAll('_', ' ').toLowerCase()
const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

function OperationsMap({ incidents, units, onIncidentSelect }: { incidents: Incident[]; units: Unit[]; onIncidentSelect: (id: string) => void }) {
  if (!mapsApiKey) return <div className="map-fallback"><div className="map-grid" /><strong>Google Maps is ready for its API key</strong><span>Add the restricted key as the GitHub secret GOOGLE_MAPS_API_KEY.</span>{incidents.map((incident, index) => <button key={incident.id} className={`fallback-pin incident-marker pin-${index + 1}`} onClick={() => onIncidentSelect(incident.id)}>P{incident.priority}</button>)}{units.map((unit, index) => <span key={unit.callSign} className={`fallback-pin unit-marker unit-${index + 1}`}>{unit.callSign.split(' ')[0][0]}{unit.callSign.split(' ')[1]}</span>)}</div>
  return <APIProvider apiKey={mapsApiKey}><Map defaultCenter={{ lat: 36.958, lng: -92.661 }} defaultZoom={13} mapId="DEMO_MAP_ID" gestureHandling="greedy" disableDefaultUI>{incidents.map((incident) => <AdvancedMarker key={incident.id} position={{ lat: incident.latitude, lng: incident.longitude }} onClick={() => onIncidentSelect(incident.id)}><button className={`gmap-marker priority-${incident.priority}`} aria-label={`Open incident ${incident.number}`}>P{incident.priority}</button></AdvancedMarker>)}{units.map((unit) => <AdvancedMarker key={unit.callSign} position={{ lat: unit.latitude, lng: unit.longitude }}><div className={`gmap-marker gmap-unit ${unit.status.toLowerCase()}`} title={`${unit.callSign}: ${statusLabel(unit.status)}`}>{unit.callSign.replace(' ', '')}</div></AdvancedMarker>)}</Map></APIProvider>
}

export function App() {
  const [view, setView] = useState<View>('Dispatch')
  const [incidents, setIncidents] = useState(initialIncidents)
  const [units, setUnits] = useState(initialUnits)
  const [messages, setMessages] = useState(initialMessages)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  const [showNewCall, setShowNewCall] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [messageDraft, setMessageDraft] = useState('')
  const [messageScope, setMessageScope] = useState('All departments')
  const [assignments, setAssignments] = useState<Record<string, CommandAssignment[]>>({ mvc: [{ id: 1, group: 'Patient Care', unit: 'Medic 1', task: 'Triage and patient care' }, { id: 2, group: 'Extrication', unit: 'Engine 2', task: 'Stabilize vehicles' }] })
  const [groupDraft, setGroupDraft] = useState('Operations')
  const [unitDraft, setUnitDraft] = useState('Car 12')
  const [taskDraft, setTaskDraft] = useState('Traffic control')

  const selectedIncident = incidents.find((incident) => incident.id === selectedIncidentId) ?? null
  const availableCount = units.filter((unit) => unit.status === 'AVAILABLE').length
  const committedCount = units.filter((unit) => unit.incidentId).length
  const openIncident = (id: string) => { setSelectedIncidentId(id); setView('Incidents') }
  const updateUnitStatus = (callSign: string, status: UnitStatus) => setUnits((current) => current.map((unit) => unit.callSign === callSign ? { ...unit, status } : unit))
  const addNote = (event: FormEvent) => { event.preventDefault(); if (!selectedIncident || !noteDraft.trim()) return; setIncidents((current) => current.map((incident) => incident.id === selectedIncident.id ? { ...incident, notes: [...incident.notes, noteDraft.trim()] } : incident)); setNoteDraft('') }
  const sendMessage = (event: FormEvent) => { event.preventDefault(); if (!messageDraft.trim()) return; setMessages((current) => [...current, { id: Date.now(), sender: 'Dispatcher', scope: messageScope, body: messageDraft.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); setMessageDraft('') }
  const addAssignment = (event: FormEvent) => { event.preventDefault(); if (!selectedIncident || !taskDraft.trim()) return; setAssignments((current) => ({ ...current, [selectedIncident.id]: [...(current[selectedIncident.id] ?? []), { id: Date.now(), group: groupDraft, unit: unitDraft, task: taskDraft.trim() }] })); setUnits((current) => current.map((unit) => unit.callSign === unitDraft ? { ...unit, incidentId: selectedIncident.id, status: 'ASSIGNED' } : unit)); setTaskDraft('') }
  const createIncident = (incident: Incident) => { setIncidents((current) => [...current, incident]); setShowNewCall(false); setSelectedIncidentId(incident.id); setView('Incidents') }

  return <div className="shell">
    <header className="topbar"><div className="brand"><span className="mark">O911</span><div><strong>Open911</strong><small>Training Agency · Dispatch</small></div></div><div className="system"><span className="demo-badge">Interactive demo · simulated data</span><span className="live-dot" /> Demo systems operational <button>Dispatcher ▾</button></div></header>
    <nav className="sidebar" aria-label="Primary navigation">{(['Dispatch', 'Incidents', 'Units', 'Messages', 'Administration'] as View[]).map((item) => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item}</button>)}</nav>
    <main>{view === 'Dispatch' && <DispatchView incidents={incidents} units={units} availableCount={availableCount} committedCount={committedCount} onOpenIncident={openIncident} onNewCall={() => setShowNewCall(true)} onUnitStatus={updateUnitStatus} />}{view === 'Incidents' && <IncidentsView incidents={incidents} selectedId={selectedIncidentId} onSelect={setSelectedIncidentId} onNewCall={() => setShowNewCall(true)} />}{view === 'Units' && <UnitsView units={units} incidents={incidents} onStatus={updateUnitStatus} />}{view === 'Messages' && <MessagesView messages={messages} draft={messageDraft} scope={messageScope} onDraft={setMessageDraft} onScope={setMessageScope} onSend={sendMessage} />}{view === 'Administration' && <AdministrationView />}</main>
    {selectedIncident && view === 'Incidents' && <IncidentDrawer incident={selectedIncident} units={units.filter((unit) => unit.incidentId === selectedIncident.id)} assignments={assignments[selectedIncident.id] ?? []} noteDraft={noteDraft} groupDraft={groupDraft} unitDraft={unitDraft} taskDraft={taskDraft} allUnits={units} onClose={() => setSelectedIncidentId(null)} onNoteDraft={setNoteDraft} onAddNote={addNote} onGroupDraft={setGroupDraft} onUnitDraft={setUnitDraft} onTaskDraft={setTaskDraft} onAddAssignment={addAssignment} />}
    {showNewCall && <NewCallModal sequence={incidents.length + 184} onClose={() => setShowNewCall(false)} onCreate={createIncident} />}
  </div>
}

function DispatchView({ incidents, units, availableCount, committedCount, onOpenIncident, onNewCall, onUnitStatus }: { incidents: Incident[]; units: Unit[]; availableCount: number; committedCount: number; onOpenIncident: (id: string) => void; onNewCall: () => void; onUnitStatus: (callSign: string, status: UnitStatus) => void }) {
  return <><section className="summary"><div><strong>{incidents.length}</strong><span>Active incidents</span></div><div><strong>{committedCount}</strong><span>Units committed</span></div><div><strong>{availableCount}</strong><span>Units available</span></div><div><strong>0</strong><span>Unacknowledged pages</span></div></section><section className="workspace"><div className="map-panel"><div className="map-toolbar"><button>All disciplines</button><button>Traffic</button><button>Layers</button></div><OperationsMap incidents={incidents} units={units} onIncidentSelect={onOpenIncident} /></div><aside className="activity"><div className="section-heading"><div><h2>Active incidents</h2><p>Sorted by priority</p></div><button className="primary" onClick={onNewCall}>+ New call</button></div>{[...incidents].sort((a, b) => a.priority - b.priority).map((incident) => <IncidentCard key={incident.id} incident={incident} onOpen={() => onOpenIncident(incident.id)} />)}<div className="section-heading unit-heading"><div><h2>Units</h2><p>Click a status to simulate an update</p></div></div><div className="unit-list">{units.map((unit) => <UnitRow key={unit.callSign} unit={unit} onStatus={onUnitStatus} />)}</div></aside></section></>
}

function IncidentsView({ incidents, selectedId, onSelect, onNewCall }: { incidents: Incident[]; selectedId: string | null; onSelect: (id: string) => void; onNewCall: () => void }) {
  return <section className="page-panel"><div className="page-title"><div><p className="eyebrow">OPERATIONS</p><h1>Incidents</h1><p>Select an incident to update notes, assignments, and command organization.</p></div><button className="primary" onClick={onNewCall}>+ Create incident</button></div><div className="incident-grid">{incidents.map((incident) => <button key={incident.id} className={`incident-tile ${selectedId === incident.id ? 'selected' : ''}`} onClick={() => onSelect(incident.id)}><span className={`priority p${incident.priority}`}>P{incident.priority}</span><div><strong>{incident.type}</strong><p>{incident.address}</p><small>{incident.number} · {incident.state} · {incident.age}</small></div></button>)}</div></section>
}

function UnitsView({ units, incidents, onStatus }: { units: Unit[]; incidents: Incident[]; onStatus: (callSign: string, status: UnitStatus) => void }) {
  return <section className="page-panel"><div className="page-title"><div><p className="eyebrow">RESOURCES</p><h1>Units and apparatus</h1><p>Personnel and apparatus remain separate resources in the production model.</p></div></div><div className="data-table"><div className="table-row table-head"><span>Unit</span><span>Discipline</span><span>Assignment</span><span>Status</span></div>{units.map((unit) => <div className="table-row" key={unit.callSign}><span><strong>{unit.callSign}</strong><small>{unit.kind}</small></span><span>{unit.discipline}</span><span>{incidents.find((incident) => incident.id === unit.incidentId)?.number ?? 'Unassigned'}</span><select value={unit.status} onChange={(event) => onStatus(unit.callSign, event.target.value as UnitStatus)}>{(['AVAILABLE', 'ASSIGNED', 'RESPONDING', 'ON_SCENE', 'OUT_OF_SERVICE'] as UnitStatus[]).map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></div>)}</div></section>
}

function MessagesView({ messages, draft, scope, onDraft, onScope, onSend }: { messages: Message[]; draft: string; scope: string; onDraft: (value: string) => void; onScope: (value: string) => void; onSend: (event: FormEvent) => void }) {
  return <section className="page-panel messages-page"><div className="page-title"><div><p className="eyebrow">COMMUNICATIONS</p><h1>Messages and paging</h1><p>Demo messages remain in this browser and are never transmitted.</p></div></div><div className="message-feed">{messages.map((message) => <article key={message.id}><div><strong>{message.sender}</strong><span>{message.scope} · {message.time}</span></div><p>{message.body}</p></article>)}</div><form className="message-compose" onSubmit={onSend}><select value={scope} onChange={(event) => onScope(event.target.value)}><option>All departments</option><option>Fire department</option><option>Law enforcement</option><option>EMS</option><option>Incident 26-000184</option></select><input value={draft} onChange={(event) => onDraft(event.target.value)} placeholder="Type a simulated message…" /><button className="primary">Send demo message</button></form></section>
}

function AdministrationView() {
  const cards = [['Departments', '3', 'Law, Fire, EMS'], ['Responders', '42', '38 currently active'], ['Apparatus', '18', '15 operational'], ['Radio channels', '12', '4 tactical channels'], ['Equipment', '87', '6 inspections due'], ['Roles', '7', 'Least-privilege templates']]
  return <section className="page-panel"><div className="page-title"><div><p className="eyebrow">CONFIGURATION</p><h1>Administration</h1><p>Representative agency configuration. Editing is disabled in the public demo.</p></div></div><div className="admin-grid">{cards.map(([title, value, detail]) => <article key={title}><span>{title}</span><strong>{value}</strong><p>{detail}</p><button disabled>Manage</button></article>)}</div></section>
}

function IncidentCard({ incident, onOpen }: { incident: Incident; onOpen: () => void }) { return <article className="incident"><span className={`priority p${incident.priority}`}>P{incident.priority}</span><div><strong>{incident.type}</strong><p>{incident.address}</p><small>{incident.number} · {incident.state} · {incident.age}</small></div><button onClick={onOpen}>Open</button></article> }
function UnitRow({ unit, onStatus }: { unit: Unit; onStatus: (callSign: string, status: UnitStatus) => void }) { const cycle: UnitStatus[] = ['AVAILABLE', 'ASSIGNED', 'RESPONDING', 'ON_SCENE', 'OUT_OF_SERVICE']; const next = cycle[(cycle.indexOf(unit.status) + 1) % cycle.length]; return <button className="unit" onClick={() => onStatus(unit.callSign, next)}><span className={`status ${unit.status.toLowerCase()}`} /><div><strong>{unit.callSign}</strong><small>{unit.kind}</small></div><em>{statusLabel(unit.status)}</em></button> }

function IncidentDrawer({ incident, units, assignments, noteDraft, groupDraft, unitDraft, taskDraft, allUnits, onClose, onNoteDraft, onAddNote, onGroupDraft, onUnitDraft, onTaskDraft, onAddAssignment }: { incident: Incident; units: Unit[]; assignments: CommandAssignment[]; noteDraft: string; groupDraft: string; unitDraft: string; taskDraft: string; allUnits: Unit[]; onClose: () => void; onNoteDraft: (value: string) => void; onAddNote: (event: FormEvent) => void; onGroupDraft: (value: string) => void; onUnitDraft: (value: string) => void; onTaskDraft: (value: string) => void; onAddAssignment: (event: FormEvent) => void }) {
  return <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="incident-drawer"><button className="close" onClick={onClose}>×</button><div className="drawer-header"><span className={`priority p${incident.priority}`}>P{incident.priority}</span><div><p>{incident.number}</p><h2>{incident.type}</h2><span>{incident.address}</span></div></div><div className="incident-meta"><div><span>Status</span><strong>{incident.state}</strong></div><div><span>Radio</span><strong>{incident.channel}</strong></div><div><span>Assigned</span><strong>{units.length} units</strong></div></div><section><h3>Call information</h3><p>{incident.summary}</p></section><section><h3>Call notes</h3><ol className="notes">{incident.notes.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}</ol><form className="inline-form" onSubmit={onAddNote}><input value={noteDraft} onChange={(event) => onNoteDraft(event.target.value)} placeholder="Add a simulated call note…" /><button className="primary">Add note</button></form></section><section><h3>Command organization</h3><div className="assignment-list">{assignments.length ? assignments.map((assignment) => <div key={assignment.id}><strong>{assignment.group}</strong><span>{assignment.unit}</span><p>{assignment.task}</p></div>) : <p>No command assignments yet.</p>}</div><form className="command-form" onSubmit={onAddAssignment}><select value={groupDraft} onChange={(event) => onGroupDraft(event.target.value)}><option>Command</option><option>Operations</option><option>Patient Care</option><option>Extrication</option><option>Traffic</option><option>Staging</option></select><select value={unitDraft} onChange={(event) => onUnitDraft(event.target.value)}>{allUnits.map((unit) => <option key={unit.callSign}>{unit.callSign}</option>)}</select><input value={taskDraft} onChange={(event) => onTaskDraft(event.target.value)} placeholder="Task or objective" /><button className="primary">Assign</button></form></section></aside></div>
}

function NewCallModal({ sequence, onClose, onCreate }: { sequence: number; onClose: () => void; onCreate: (incident: Incident) => void }) {
  const [type, setType] = useState('Structure fire'); const [address, setAddress] = useState('120 South Jefferson Street'); const [priority, setPriority] = useState(1); const incidentNumber = useMemo(() => `26-${String(sequence).padStart(6, '0')}`, [sequence])
  const submit = (event: FormEvent) => { event.preventDefault(); const id = `demo-${Date.now()}`; onCreate({ id, number: incidentNumber, priority, type, address, age: 'just now', summary: 'New simulated incident created by the interactive demo.', state: 'Dispatched', latitude: 36.958 + sequence % 5 * 0.002, longitude: -92.661 + sequence % 4 * 0.002, channel: 'OPS 1', notes: ['Incident created in public demo.'] }) }
  return <div className="modal-backdrop"><form className="modal" onSubmit={submit}><button type="button" className="close" onClick={onClose}>×</button><p className="eyebrow">SIMULATED CALL INTAKE</p><h2>Create incident</h2><label>Incident number<input value={incidentNumber} disabled /></label><label>Call type<input value={type} onChange={(event) => setType(event.target.value)} required /></label><label>Address<input value={address} onChange={(event) => setAddress(event.target.value)} required /></label><label>Priority<select value={priority} onChange={(event) => setPriority(Number(event.target.value))}><option value={1}>Priority 1</option><option value={2}>Priority 2</option><option value={3}>Priority 3</option></select></label><div className="modal-actions"><button type="button" onClick={onClose}>Cancel</button><button className="primary">Create simulated incident</button></div></form></div>
}
