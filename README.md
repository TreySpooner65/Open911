# Open911

Open911 is an open-source, multi-agency computer-aided dispatch and situational-awareness platform for law enforcement, fire, and EMS.

The system is designed around three connected surfaces:

- **Responder app** — an Android application with Overview, Incident, and Command workspaces.
- **Dispatch portal** — a web interface for call intake, dispatch, unit tracking, messaging, and administration.
- **Platform API** — a realtime backend that owns agency isolation, incidents, units, assignments, status history, command structure, and audit events.

> Open911 is in early development. It is not yet approved or tested as a sole mission-critical dispatch system.

## Public demo

The simulated dispatch portal is published at [treyspooner65.github.io/Open911](https://treyspooner65.github.io/Open911/). It contains demonstration data only and is not connected to an operational dispatch system.

## Repository layout

```text
android/    Native Kotlin/Jetpack Compose responder app
backend/    Kotlin/Spring Boot API
web/        React/TypeScript dispatch and administration portal
database/   PostgreSQL/PostGIS schema migrations
docs/       Architecture, domain, safety, and security decisions
```

## Run the starter applications

### Backend

Requires Java 21 and Maven 3.9+.

```bash
cd backend
mvn spring-boot:run
```

The development bootstrap endpoint is available at `http://localhost:8080/api/v1/bootstrap` and health at `http://localhost:8080/actuator/health`.

### Dispatch portal

Requires Node.js 22+.

```bash
cd web
npm install
npm run dev
```

The portal uses representative development data until API authentication and realtime synchronization are connected.


### Android responder app

Open the `android` directory in Android Studio, allow Gradle to sync, and run the `app` configuration on an Android 8.0+ device or emulator.

## Initial principles

- Every operational record belongs to exactly one agency.
- Responders, apparatus, equipment, and radio channels are independent resources.
- Current status is convenient state; status history and audit events are authoritative history.
- Incident command grows from a single commander into branches, divisions, groups, crews, and tasks without changing the incident model.
- Location sharing is explicit, role-controlled, retained only as required, and visible to the responder.
- Offline and degraded-network behavior must be designed and tested before operational deployment.

See [Architecture](docs/architecture.md), [Domain model](docs/domain-model.md), and [Safety and security](docs/safety-security.md).

## License

GNU General Public License v3.0. See [LICENSE](LICENSE).
