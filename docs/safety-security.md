# Safety and security baseline

Open911 may process criminal-justice information, protected health information, precise location, and operationally sensitive data. Security and reliability are product behavior, not deployment add-ons.

## Required controls

- Agency-scoped authorization on every request and subscription.
- Least-privilege roles for dispatcher, administrator, command, supervisor, responder, and read-only users.
- MFA for dispatch and administrative access.
- Short-lived access tokens, revocable device sessions, and registered-device visibility.
- Encryption in transit and at rest with managed key rotation.
- Append-only audit events for authentication, viewing sensitive records, exports, configuration, and all operational mutations.
- Rate limits, abuse detection, secure secret storage, dependency scanning, and signed releases.
- Configurable retention with legal-hold support and explicit location-history policy.
- No production secrets or map keys in source control or mobile resources.

## Location privacy

- Show responders when location sharing is active.
- Collect only at an agency-configured cadence and operational state.
- Separate latest operational position from optional retained history.
- Restrict bulk location export and record every export.
- Define off-duty behavior before field testing; do not infer consent from app installation.

## Operational readiness gates

Open911 must not become the sole operational CAD until the project has validated:

1. Offline and intermittent-connectivity behavior.
2. Message ordering, duplicate handling, and clock skew.
3. Backup restoration and regional failure recovery.
4. Load and soak testing at expected incident scale.
5. Penetration testing and third-party security review.
6. Agency training, permissions review, and operational fallback procedures.
7. Applicable CJIS, HIPAA, state records, retention, and public-records obligations with qualified counsel and agency stakeholders.

