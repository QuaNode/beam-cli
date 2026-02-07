# Service (Behaviour Layer)
Bridge layer between the CLI commands and the js-behaviours core execution engine.

## Overview

The Service layer provides a typed, Observable-based API that the CLI uses to discover, run, and track backend behaviours.
It keeps the command handlers thin by centralizing execution, parameter resolution, caching, and error handling inside services.

Architecture
text
   [ CLI  ]
      ↓
[ RequestsService (Registry/Cache) ]  ⇄  [ BehaviourService (Orchestrator) ]
      ↓
[ js-behaviours (Core Execution Engine) ]
      ↓
[ Backend API / WebSocket ]


### Key Concepts

- **js-behaviours**: Core engine that discovers behaviours and returns executable handlers.
- **RequestsService**: CLI state/cache manager; loads the behaviours list, stores parameter drafts, caches responses, and exposes “current run” metadata.
- **BehaviourService**: CLI executor; resolves a behaviour runner by name and executes it with parsed CLI parameters, streaming success/error back to the store.

---

### Initialization (Factory Provider)

Goal: create a singleton Behaviours instance using runtime CLI config (baseURL + prefix).

```
export function getBehaviours(http: HttpClient): Behaviours {
  const config = inject(TEST_BEHAVIOURS_UI_CONFIG);

  const fullURL = config.baseURL
    ? new URL(config.prefix, config.baseURL).href
    : config.prefix;

  return new Behaviours(http, fullURL);
}
```

RequestsService (Discovery + State)
Responsibilities

Wait for engine readiness before running any CLI command.

Fetch behaviour registry from /behaviours (powers beam list and validation for beam run <name>).

Map the backend dictionary into a CLI-friendly array (or Map) for fast lookup.

Maintain state for CLI output and tooling: loading, requests list, active request, last response, last error, execution timing.

Persist drafts and cached results using a CLI-appropriate store (filesystem cache recommended for Node CLIs; localStorage only applies to browser contexts).

Example
```ts
this.behaviours.ready(() => {
  this.behaviours.behaviours({}).subscribe({
    next: (res) => {
      this.requests.set(Object.keys(res).map(name => ({ name, ...res[name] })));
    },
    error: () => this.requests.set([])
  });
});
```

BehaviourService (Execution)
Responsibilities
Resolve behaviour runner: behaviours.getBehaviour(name).

Inject parameters parsed from CLI flags/stdin/config file.

Execute the behaviour (Observable) and handle subscription lifecycle.

Push success/error + execution timing back into RequestsService.

Return/print formatted output suitable for terminals (pretty JSON, raw output, or quiet mode), and set exit codes appropriately.

Example


```ts
send(requestName: string): void {
  const fn = this.behaviours.getBehaviour(requestName);

  fn(this.parametersSignal()).subscribe({
    next: (response) => this.updateResponse(response),
    error: (error) => this.errorSignal.set(error)
  });
}
```

CLI Capabilities
List behaviours: Auto-scan backend (/behaviours) and display available commands (e.g., beam list).

Run behaviour: Execute a behaviour by name (e.g., beam run <name>) with dynamic parameter resolution (path/query/header/body).

Caching: Store responses and parameter drafts to speed up repeated calls and enable offline inspection.

Exports (optional): Support file output (e.g., --out result.json) for scripting and pipelines.

WebSocket (optional): Support event-based behaviours and stream events to stdout.

Configuration
```ts
export interface BehavioursConfig {
  baseURL: string; // e.g. http://localhost:3000
  prefix: string;  // e.g. /api
}
```


### Error Handling Best Practices

Handle Observable errors centrally using catchError or custom error handlers  
Consider retry logic for transient failures like network errors  
Log errors with timestamps request name and parameters for easier debugging  
Gracefully handle unexpected responses from backend behaviours  

**Related Code / Services:**  
- `BehaviourService.send(requestName)`  
- `RequestsService.behaviours()`  
- `Observable subscription error handling`  

---

### Performance & Optimization

Cache frequently used responses to reduce backend calls  
Track execution time performance.now for monitoring and profiling  
Lazy-load behaviours when possible to reduce memory usage at startup  
Avoid unnecessary re-subscriptions to Observables to prevent duplicate executions  

**Related Code / Services:**  
- `RequestsService.set()` caching logic  
- `BehaviourService.send()` execution timing  
- `performance.now()` usage  
- Lazy-loading behaviours through `behaviours.getBehaviour(name)`  

---

### Parameter Management

Validate CLI parameters before executing behaviours  
Provide default values for parameters when not specified  
Normalize parameter types numbers booleans dates to avoid runtime errors  
Consider marking optional vs required parameters for CLI guidance  

**Related Code / Services:**  
- `parametersSignal.set(params)`  
- `BehaviourService.send()` parameter injection  
- `BehaviourService.getBehaviour(name)` parameter usage  

---

### Observables & Subscriptions

Always unsubscribe to prevent memory leaks subscription.unsubscribe or take(1)  
For single-response behaviours consider using firstValueFrom instead of a full subscription  
For streaming or event-based behaviours properly clean up subscriptions on termination  
Use signals or reactive state to propagate updates to the CLI or UI  

**Related Code / Services:**  
- `fn(this.parametersSignal()).subscribe(...)` in `BehaviourService.send()`  
- `RequestsService.behaviours().subscribe(...)`  
- `signals` usage to propagate CLI updates (`errorSignal`, `responseSignal`)  

---

### Testing Tips

Write unit tests for BehaviourService to mock behaviours and test outputs  
Test RequestsService caching logic independently from the backend  
Use integration tests to verify CLI → BehaviourService → js-behaviours → backend flow  
Include tests for error scenarios and edge cases like missing parameters or failed requests  

**Related Code / Services:**  
- `BehaviourService.send() / sendOnly() / sendAndDownload()`  
- `RequestsService.set()` caching  
- Integration flow: CLI → BehaviourService → js-behaviours → backend  

---

### Extensibility

Add new behaviours without modifying core services  
Use a plugin or modular approach for a growing number of behaviours  
Consider pre- or post-execution hooks for logging metrics or custom transformations  
Keep BehaviourService thin by delegating reusable logic to utility functions  

**Related Code / Services:**  
- `BehaviourService.getBehaviour(name)`  
- Utility functions for reusable logic  
- Modular handling of behaviours  

---

### Security Considerations

Validate all input parameters to prevent injection attacks  
Mask sensitive data in CLI outputs like passwords tokens or secrets  
Secure WebSocket connections and authentication tokens in multi-user setups  
Avoid logging sensitive data in shared environments  

**Related Code / Services:**  
- `parametersSignal.set(params)` input validation  
- `updateResponse()` handling output  
- WebSocket connection usage (if any)  

---

### Optional Features & Enhancements

Support configuration via JSON or YAML files for CLI presets  
Enable parallel execution for independent behaviours  
Stream event logs to stdout with filters for debugging  
Add configurable output formats like pretty JSON raw or quiet mode for scripting and pipelines  

**Related Code / Services:**  
- `sendAndDownload()` output handling  
- `RequestsService.behaviours().subscribe(...)` streaming  
- Output formatting in CLI commands