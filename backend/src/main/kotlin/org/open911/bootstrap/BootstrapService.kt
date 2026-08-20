package org.open911.bootstrap

import org.open911.domain.AgencySummary
import org.open911.domain.BootstrapSnapshot
import org.open911.domain.CanonicalStatus
import org.open911.domain.Discipline
import org.open911.domain.GeoPoint
import org.open911.domain.IncidentState
import org.open911.domain.IncidentSummary
import org.open911.domain.UnitSummary
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class BootstrapService {
    private val agencyId = UUID.fromString("8ecae761-18d4-4e3e-891b-9bdf163285a8")
    private val incidentId = UUID.fromString("8c9d47bb-6dc0-4a62-8797-2879571cf81e")

    fun snapshot(now: Instant = Instant.now()) = BootstrapSnapshot(
        agency = AgencySummary(
            id = agencyId,
            name = "Open911 Training Agency",
            disciplines = setOf(Discipline.LAW_ENFORCEMENT, Discipline.FIRE, Discipline.EMS),
        ),
        incidents = listOf(
            IncidentSummary(
                id = incidentId,
                agencyId = agencyId,
                incidentNumber = "26-000184",
                type = "Motor vehicle collision",
                priority = 1,
                state = IncidentState.ACTIVE,
                address = "MO-5 & County Road 305",
                location = GeoPoint(36.9512, -92.6604),
                summary = "Two vehicles, roadway partially blocked. Use caution on approach.",
                updatedAt = now,
            ),
        ),
        units = listOf(
            UnitSummary(UUID.fromString("85920ed5-4021-455d-9c7b-a42dc4e0aafc"), agencyId, "Medic 1", "AMBULANCE", CanonicalStatus.ON_SCENE, GeoPoint(36.9513, -92.6602), incidentId),
            UnitSummary(UUID.fromString("51a5bcda-3e76-4982-95b0-aeb9cd41a81b"), agencyId, "Engine 2", "ENGINE", CanonicalStatus.RESPONDING, GeoPoint(36.9601, -92.6720), incidentId),
            UnitSummary(UUID.fromString("a04ad2fa-349e-4bb0-8b48-53190467abe5"), agencyId, "Car 12", "PATROL", CanonicalStatus.AVAILABLE, GeoPoint(36.9730, -92.6531), null),
        ),
        generatedAt = now,
    )
}

