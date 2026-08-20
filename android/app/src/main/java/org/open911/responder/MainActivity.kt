package org.open911.responder

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
data class Destination(val label: String, val route: String, val icon: ImageVector)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme(colorScheme = darkColorScheme()) { Surface { Open911App() } } }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Open911App() {
    val navController = rememberNavController()
    val destinations = listOf(
        Destination("Overview", "overview", Icons.Default.Home),
        Destination("Incident", "incident", Icons.Default.Info),
        Destination("Command", "command", Icons.Default.List),
    )
    val current = navController.currentBackStackEntryAsState().value?.destination

    Scaffold(
        topBar = { TopAppBar(title = { Column { Text("Open911"); Text("Medic 1 · On Scene", style = MaterialTheme.typography.labelSmall) } }) },
        bottomBar = {
            NavigationBar {
                destinations.forEach { destination ->
                    NavigationBarItem(
                        selected = current?.route == destination.route,
                        onClick = { navController.navigate(destination.route) { launchSingleTop = true; popUpTo("overview") { saveState = true }; restoreState = true } },
                        icon = { Icon(destination.icon, contentDescription = null) },
                        label = { Text(destination.label) },
                    )
                }
            }
        },
    ) { padding ->
        NavHost(navController, startDestination = "overview", modifier = Modifier.padding(padding)) {
            composable("overview") { OverviewScreen() }
            composable("incident") { IncidentScreen() }
            composable("command") { CommandScreen() }
        }
    }
}

@Composable
private fun OverviewScreen() = Screen("Overview") {
    StatusCard("Active incidents", "2", "One priority incident")
    StatusCard("Available units", "7", "Across law, fire, and EMS")
    Section("Units", listOf("Medic 1 · On Scene", "Engine 2 · Responding", "Car 12 · Available"))
}

@Composable
private fun IncidentScreen() = Screen("Current incident") {
    StatusCard("P1 · MVC", "26-000184", "MO-5 & County Road 305")
    Section("Safety", listOf("Roadway partially blocked", "Two vehicles reported", "Use caution on approach"))
    Section("Assigned", listOf("Medic 1", "Engine 2", "Command: Chief 1"))
}

@Composable
private fun CommandScreen() = Screen("Command") {
    StatusCard("Incident command", "Chief 1", "Command · TAC 2")
    Section("Groups", listOf("Extrication · Engine 2", "Patient care · Medic 1", "Traffic · Car 12"))
    Section("Open tasks", listOf("Establish landing zone", "Confirm second transport unit"))
}

@Composable
private fun Screen(title: String, content: @Composable ColumnScope.() -> Unit) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text(title, style = MaterialTheme.typography.headlineSmall) }
        item { Column(verticalArrangement = Arrangement.spacedBy(12.dp), content = content) }
    }
}

@Composable
private fun StatusCard(title: String, value: String, detail: String) {
    Card(Modifier.fillMaxWidth()) { Column(Modifier.padding(16.dp)) { Text(title, style = MaterialTheme.typography.labelLarge); Spacer(Modifier.height(6.dp)); Text(value, style = MaterialTheme.typography.headlineMedium); Text(detail, style = MaterialTheme.typography.bodyMedium) } }
}

@Composable
private fun Section(title: String, rows: List<String>) {
    Card(Modifier.fillMaxWidth()) { Column(Modifier.padding(16.dp)) { Text(title, style = MaterialTheme.typography.titleMedium); rows.forEach { Row(Modifier.fillMaxWidth().padding(top = 10.dp)) { Text(it) } } } }
}
