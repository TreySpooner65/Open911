package org.open911.bootstrap

import org.open911.domain.BootstrapSnapshot
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/bootstrap")
class BootstrapController(private val service: BootstrapService) {
    @GetMapping
    fun getSnapshot(): BootstrapSnapshot = service.snapshot()
}

