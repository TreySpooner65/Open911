package org.open911

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class Open911Application

fun main(args: Array<String>) {
    runApplication<Open911Application>(*args)
}

