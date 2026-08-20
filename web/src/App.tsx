type Unit = {
  callSign: string
  kind: string
  status: 'AVAILABLE' | 'RESPONDING' | 'ON_SCENE' | 'OUT_OF_SERVICE'
}

const incidents = [
  { number: '26-000184', priority: 1, type: 'Motor vehicle collision', address: 'MO-5 & County Road 305', age: '12 min' },
  { number: '26-000185', priority: 2, type: 'Difficulty breathing', address: '410 Valley Street', age: '4 min' },
]

const units: Unit[] = [
  { callSign: 'Medic 1', kind: 'Ambulance', status: 'ON_SCENE' },
  { callSign: 'Engine 2', kind: 'Engine', status: 'RESPONDING' },
  { callSign: 'Car 12', kind: 'Patrol', status: 'AVAILABLE' },
  { callSign: 'Rescue 4', kind: 'Rescue', status: 'OUT_OF_SERVICE' },
]

const label = (value: string) => value.replaceAll('_', ' ').toLowerCase()

export function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand"><span className="mark">O911</span><div><strong>Open911</strong><small>Training Agency · Dispatch</small></div></div>
        <div className="system"><span className="live-dot" /> All systems operational <button>Dispatcher ▾</button></div>
      </header>
      <nav className="sidebar" aria-label="Primary navigation">
        <button className="active">Dispatch</button><button>Incidents</button><button>Units</button><button>Messages</button><button>Administration</button>
      </nav>
      <main>
        <section className="summary">
          <div><strong>2</strong><span>Active incidents</span></div><div><strong>3</strong><span>Units committed</span></div><div><strong>7</strong><span>Units available</span></div><div><strong>0</strong><span>Unacknowledged pages</span></div>
        </section>
        <section className="workspace">
          <div className="map-panel">
            <div className="map-toolbar"><button>All disciplines</button><button>Traffic</button><button>Layers</button></div>
            <div className="road road-a" /><div className="road road-b" />
            <div className="map-label north">N</div><div className="map-label town">AVA</div>
            <span className="pin incident-pin">P1</span><span className="pin unit-pin one">M1</span><span className="pin unit-pin two">E2</span><span className="pin available-pin">12</span>
          </div>
          <aside className="activity">
            <div className="section-heading"><div><h2>Active incidents</h2><p>Sorted by priority</p></div><button className="primary">+ New call</button></div>
            {incidents.map((incident) => <article className="incident" key={incident.number}>
              <span className={`priority p${incident.priority}`}>P{incident.priority}</span><div><strong>{incident.type}</strong><p>{incident.address}</p><small>{incident.number} · {incident.age}</small></div><button>Open</button>
            </article>)}
            <div className="section-heading unit-heading"><div><h2>Units</h2><p>Current operational status</p></div></div>
            <div className="unit-list">{units.map((unit) => <div className="unit" key={unit.callSign}><span className={`status ${unit.status.toLowerCase()}`} /><div><strong>{unit.callSign}</strong><small>{unit.kind}</small></div><em>{label(unit.status)}</em></div>)}</div>
          </aside>
        </section>
      </main>
    </div>
  )
}

