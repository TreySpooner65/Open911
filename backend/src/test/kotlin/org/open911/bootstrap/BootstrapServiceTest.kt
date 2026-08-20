package org.open911.bootstrap

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.open911.domain.CanonicalStatus
import java.time.Instant

class BootstrapServiceTest {
    @Test
    fun `snapshot keeps every record inside the selected agency`() {
        val snapshot = BootstrapService().snapshot(Instant.parse("2026-08-20T00:00:00Z"))

        assertThat(snapshot.incidents).allMatch { it.agencyId == snapshot.agency.id }
        assertThat(snapshot.units).allMatch { it.agencyId == snapshot.agency.id }
        assertThat(snapshot.units.map { it.status }).contains(CanonicalStatus.ON_SCENE)
    }
}

