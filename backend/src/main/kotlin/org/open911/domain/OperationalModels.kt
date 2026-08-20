package org.open911.domain

import java.time.Instant
import java.util.UUID

enum class Discipline { LAW_ENFORCEMENT, FIRE, EMS, EMERGENCY_MANAGEMENT, OTHER }

enum class CanonicalStatus {
    AVAILABLE,
    ASSIGNED,
    RESPONDING,
    ON_SCENE,
    TRANSPORTING,
    AT_DESTINATION,
    CLEARING,
    OUT_OF_SERVICE,
}

enum class IncidentState { PENDING, DISPATCHED, ACTIVE, CONTROLLED, CLOSED, CANCELLED }

data class GeoPoint(val latitude: Double, val longitude: Double)

data class AgencySummary(
    val id: UUID,
    val name: String,
    val disciplines: Set<Discipline>,
)

data class UnitSummary(
    val id: UUID,
    val agencyId: UUID,
    val callSign: String,
    val kind: String,
    val status: CanonicalStatus,
    val position: GeoPoint?,
    val assignedIncidentId: UUID?,
)

data class IncidentSummary(
    val id: UUID,
    val agencyId: UUID,
    val incidentNumber: String,
    val type: String,
    val priority: Int,
    val state: IncidentState,
    val address: String,
    val location: GeoPoint,
    val summary: String,
    val updatedAt: Instant,
)

data class BootstrapSnapshot(
    val agency: AgencySummary,
    val incidents: List<IncidentSummary>,
    val units: List<UnitSummary>,
    val generatedAt: Instant,
)

