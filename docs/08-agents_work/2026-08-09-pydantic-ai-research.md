---
date: 2026-08-09
researcher: researcher (Research-Lead task)
subject: "Pydantic AI — agent framework, decision-grade brief + mechanism-harvest addendum"
version_researched: "2.27.0 (v2 line, released 2026-08-08); v1.107.2 (v1 maintenance line, also released 2026-08-08)"
confidence_overall: MEDIUM-HIGH
addendum: "2026-08-09 — mechanism-harvest lens added per team-lead. Section 4 deepened with raw-source verification (GitHub raw file fetches, not doc paraphrase) for the 5 specific mechanical questions. Section 11 added as an explicit, compact restatement of the same 5 answers (positioned after §10 per team-lead's structural request) — no new research, pure cross-reference to §4. Section 12 (formerly the unnumbered 'Mechanisms worth stealing' closing section) renumbered to match. Sections 1-3, 4, 5-10 unchanged from the prior pass."
---

# Pydantic AI — Decision-Grade Research Brief

**Reading lens for this pass (per team-lead, 2026-08-09): mechanism harvest, not adoption evaluation.** Beamix is not adding Python. The question for every capability below is "what is the mechanism, and where is it implemented" — useful as prior art for a Claude-Code-based agent harness, not as a case for using this library. Section 4 and the closing sections are written to that lens explicitly; sections 1-3 and 5-10 are the original adoption-framed pass and still stand as background.

Researched 2026-08-09. Primary sources: official docs (pydantic.dev/docs/ai, note `ai.pydantic.dev` now 301-redirects here), GitHub repo `pydantic/pydantic-ai` (README, releases, issues, and — for this addendum — **raw source files** fetched directly from `raw.githubusercontent.com`), PyPI. Context7 MCP was not available in this session (no `mcp__context7__*` tools were exposed) — all doc lookups went through WebFetch on primary URLs, tier 2 in the source-priority order.

**Caveat on method:** WebFetch summarizes pages through a small model rather than returning raw text. Where this matters for API-signature accuracy, I re-fetched the same page/file asking for verbatim code blocks and cross-checked; those spots are marked HIGH. For this addendum, most of the highest-value claims (retry exhaustion, usage limits, tool schema timing, evaluator classes) were fetched directly from `.py` source files on `main`, which is materially more reliable than fetching rendered docs — those are marked HIGH with the exact file path given so you can re-verify without re-searching.

---

## 1. What it is and its core bet

Pydantic AI is a Python agent framework from the Pydantic team (makers of the Pydantic validation library and Logfire observability product), positioned as bringing "that FastAPI feeling" to GenAI app development — ergonomic, type-safe, editor-supported. (HIGH — pydantic.dev/docs/ai/overview/, accessed 2026-08-09)

**Core bet, in the framework's own words (v2 announcement):** *"the inner loop of an agent is settled by now: call the model, run a tool, feed the result back."* The framework treats that loop as a solved problem and puts all its design effort into the orchestration layer around it — composable "Capabilities" that bundle instructions, tools, lifecycle hooks, and model settings into one named unit, rather than an ever-growing flat list of tools and a 2,000-token system prompt passed to the Agent constructor. (HIGH — https://pydantic.dev/articles/pydantic-ai-v2, accessed 2026-08-09)

**What it refuses to do:** Neither the overview page nor the v2 article contains an explicit "we will not do X" statement — this is inferred from what it does, not a documented refusal. (No source — flagging as a gap rather than guessing.) The closest thing to a stated boundary is architectural: v2 deliberately keeps the *core* small (the loop, providers, the capability/hooks API) and pushes memory, guardrails, context management, filesystem access, and "code mode" into a separate opt-in package called **the Harness**, specifically so the core can stay stable while extensions "move fast." (HIGH — same source)

---

## 2. Version and maturity

| Fact | Value | Source | Confidence |
|---|---|---|---|
| Current v2-line version | `2.27.0`, released 2026-08-08T03:51:40Z | GitHub API `releases` endpoint, direct JSON, accessed 2026-08-09 | HIGH |
| Parallel v1-line version | `1.107.2`, also released 2026-08-08T03:16:08Z | same | HIGH |
| Repo created | 2024-06-21 | GitHub API repo endpoint | HIGH |
| Stars / forks / open issues | 19,157 stars / 2,490 forks / 681 open issues (as of 2026-08-08 push) | GitHub API repo endpoint | HIGH |
| 1.0 release | "September 2025" | pydantic.dev/docs/ai/project/version-policy/ (paraphrased) + corroborated independently by a third-party comparison ("hit V1 in Sept 2025") | MEDIUM-HIGH (two independent fetches agree, but I did not see an exact day-level date on either) |
| v2.0 stable release | "June 23, 2026" | WebSearch result citing pydantic.dev/docs/ai/project/version-policy/ and pydantic.dev/articles/pydantic-ai-v2 | MEDIUM (day-precision came from a search-engine summary, not a verbatim quote I pulled myself) |
| Release cadence | Effectively daily during the observed window: 10 releases across v1/v2 lines between 2026-07-27 and 2026-08-08 | GitHub API releases list | HIGH |
| Breaking-change policy | v1 gets **no intentional breaking changes** in minor releases. v2's own "no breaking changes" window is 3 months (shortened from v1's 6-month window). v1 gets security fixes for at least 6 months post-v2-stable (~through Dec 2026). Deprecated features are retained until the next major version. | pydantic.dev/docs/ai/project/version-policy/ (paraphrased) | MEDIUM |
| Org / funding | Built by "Pydantic Team" / Pydantic Services Inc. (Samuel Colvin, founder). Aggregator sites (Tracxn, Crunchbase) show $4.7M seed led by Sequoia (with Partech, Irregular Expressions, angels) and $17.2M total across 2 rounds — but I could not confirm whether this is current-2026 funding or an older (2023-era) round being resurfaced by the aggregator. | WebSearch (Tracxn/Crunchbase synthesis), accessed 2026-08-09 | LOW-MEDIUM — treat the funding figures as directionally right (VC-backed, Sequoia-led) but do not quote the dollar amounts as current without re-verifying the round dates |

**Production-readiness signal:** the README describes the project as mature/feature-complete without hedging language, and the maintained-parallel-branches pattern (v1 still shipping patches at v1.107.x while v2 is current) is itself a signal of an org treating backward compatibility seriously for existing production users. (MEDIUM — README paraphrase)

**Notable maturity nuance for Beamix's evaluation:** this is a fast-moving, near-daily-release project less than 2 years old (created June 2024). That cuts both ways — very responsive to issues (see section 8), but also a moving target for anyone pinning a version in a production dependency tree.

---

## 3. The programming model (concrete)

Confirmed via a second verbatim-quote pass against the docs (not just paraphrase). Shape below is HIGH confidence for the API surface; the specific model string `'openai:gpt-5.2'` is the docs' own illustrative example, not something I independently validated against a live model list.

```python
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext

class ChatResult(BaseModel):
    user_id: int
    message: str

agent = Agent(
    'openai:gpt-5.2',
    deps_type=str,
    output_type=ChatResult,
)

@agent.tool
async def get_user_id(ctx: RunContext[str], name: str) -> int:
    """Get a user's ID from their name."""
    return 123

result = agent.run_sync(
    'Send a message to John',
    deps='current_user'
)
print(result.output)        # ChatResult instance
print(type(result.output))  # <class '__main__.ChatResult'>
```
(HIGH — pydantic.dev/docs/ai/agents/)

**Typed dependencies:** `deps_type=` on `Agent(...)`, injected into every tool call via `RunContext[DepsType]` (`ctx.deps`). (HIGH)

**Tool registration:** `@agent.tool` decorator for context-aware tools; `@agent.tool(retries=2)` to set a per-tool retry budget. (HIGH, verbatim)

**Streaming** (verbatim quote):
```python
async with agent.run_stream('What is the capital of the UK?') as response:
    async for text in response.stream_text():
        print(text)
```
(HIGH — pydantic.dev/docs/ai/agents/)

**Validation failures fed back to the model — deepened below in section 4 with raw-source verification, since this is the highest-value question for the mechanism-harvest lens.**

---

## 4. Structured output + validation — mechanism harvest (deepened 2026-08-09)

This section answers the five specific questions in mechanical detail, each grounded in raw source from `github.com/pydantic/pydantic-ai` on `main`, fetched 2026-08-09. Where I quote a class or function, it is verbatim from the source file at the path given — re-fetch that exact `raw.githubusercontent.com/.../main/...` path to re-verify, understanding `main` moves (this is a near-daily-release repo, so pin to a commit SHA if you need long-term reproducibility, which I did not capture).

### Q1 — Validation-failure retry, in mechanical detail (highest-value question)

**What happens, step by step, when a model's output fails schema validation:**

1. A validation failure — a Pydantic `ValidationError` on tool arguments, a `ValidationError` on structured output, a tool or output-validator raising `ModelRetry`, no tool found for the given name, or plain text returned when structured output was expected — is captured and wrapped into a **`RetryPromptPart`** message part (`pydantic_ai_slim/pydantic_ai/messages.py`). This is a first-class part of the framework's own message-history type — not a side channel.

2. That `RetryPromptPart` has a **`model_response()`** method that formats the content into the literal text sent back to the model. Verbatim, from `messages.py`:
```python
def model_response(self) -> str:
    """Return a string message describing why the retry is requested."""
    if isinstance(self.content, str):
        if self.tool_name is None:
            description = f'Validation feedback:\n{self.content}'
        else:
            description = self.content
    else:
        if self.tool_name is None:
            exclude = {
                i: {'ctx', 'input'} if len(e.get('loc', ())) <= 1 else {'ctx'} for i, e in enumerate(self.content)
            }
        else:
            exclude = {'__all__': {'ctx'}}
        json_errors = error_details_ta.dump_json(self.content, exclude=exclude, indent=2)
        plural = isinstance(self.content, list) and len(self.content) != 1
        description = (
            f'{len(self.content)} validation error{"s" if plural else ""}:\n```json\n{json_errors.decode()}\n```'
        )
    return f'{description}\n\nFix the errors and try again.'
```
So the model literally sees, e.g., `2 validation errors:\n\`\`\`json\n[...pydantic ErrorDetails, ctx/input fields stripped...]\n\`\`\`\n\nFix the errors and try again.` — a bounded, structured, always-present instruction appended to raw Pydantic error details. (HIGH — verbatim, `pydantic_ai_slim/pydantic_ai/messages.py`)

3. **`ModelRetry` is real and is the tool-author-facing escape hatch.** Verbatim class, `pydantic_ai_slim/pydantic_ai/exceptions.py`:
```python
class ModelRetry(Exception):
    """Exception to raise to request a model retry.

    Can be raised from tool functions, output validators, and capability hooks
    (such as `after_model_request`, `after_tool_execute`, etc.) to send
    a retry prompt back to the model asking it to try again.

    For a terminal failure the model should see but not retry, raise
    [`ToolFailed`][pydantic_ai.exceptions.ToolFailed] instead.
    """
    message: str
    """The message to return to the model."""
```
Note the explicit design contrast the docstring draws: `ModelRetry` = "try again, here's why"; `ToolFailed` = terminal, the model sees it but does not get another attempt. Two distinct failure semantics, not one. (HIGH — verbatim)

4. **Retry counting and exhaustion are tracked separately for tool calls vs. output validation, and both raise loudly — neither silently returns `None` or a partial result.**

   - **Tool-call retries.** `pydantic_ai_slim/pydantic_ai/tool_manager.py`, method `_check_max_retries`, verbatim:
     ```python
     def _check_max_retries(self, name: str, max_retries: int, error: Exception) -> None:
         """Raise UnexpectedModelBehavior if the tool has exceeded its max retries."""
         assert self.ctx is not None
         if self.ctx.retries.get(name, 0) >= max_retries:
             raise UnexpectedModelBehavior(
                 f'Tool {name!r} exceeded max retries count of {max_retries}. Consider raising the retry '
                 'limit, or see the docs on tool retries: https://ai.pydantic.dev/tools-advanced/#tool-retries'
             ) from error
     ```
     Default: `default_max_retries: int = 1` on the `ToolManager` dataclass (fallback when a tool doesn't declare its own `max_retries`; a tool can raise this per-tool via `@agent.tool(retries=2)`). (HIGH — verbatim, `tool_manager.py`)

   - **Output validation retries.** `pydantic_ai_slim/pydantic_ai/_agent_graph.py`, method `consume_output_retry`, verbatim:
     ```python
     def consume_output_retry(
         self,
         max_output_retries: int,
         error: BaseException | None = None,
     ) -> None:
         """Record one unit of output-retry budget consumption."""
         self.output_retries_used += 1
         if self.output_retries_used > max_output_retries:
             self.check_incomplete_tool_call()
             message = f'Exceeded maximum output retries ({max_output_retries})'
             raise exceptions.UnexpectedModelBehavior(message) from error
     ```
     (HIGH — verbatim, `_agent_graph.py`)

   **Both exhaustion paths raise the same exception type, `UnexpectedModelBehavior`** (a subclass of `AgentRunError`), which propagates out of `agent.run()` / `agent.run_sync()` as a real Python exception — it is not caught internally and converted into `None`, an empty string, or a silently-truncated result. The caller either catches `UnexpectedModelBehavior` explicitly or the run crashes loud. **This is the single fact most directly relevant to your live incident**: pydantic-ai's design answer to "retries exhausted" is a distinct, typed, loud exception — not the silent-nothing-returned failure mode you're currently hitting. If your 12 agents each did full work and returned nothing after 5 retries, the mechanism gap is almost certainly that whatever is catching the retry-exhaustion condition in your harness is swallowing it (or timing out / getting killed) rather than surfacing a typed "exhausted" signal the caller can branch on.

**Retries configurable where:** per-tool via `@agent.tool(retries=N)` (verbatim-confirmed); at the agent/run level the docs describe `Agent(retries={'output': N})` and `agent.run(retries={'output': N})` for the output-validation budget — I did not re-verify this exact dict-keyed signature against source this pass (it came from a docs paraphrase in the original research round), so mark that specific call shape MEDIUM even though the exhaustion *mechanism* itself (section above) is HIGH from source.

### Q2 — Large structured returns: does a better mechanism than all-or-nothing exist?

**Yes — pydantic-ai's answer to "the model has to produce a big structured blob in one shot" is incremental partial-mode validation during streaming, not a bigger single-shot budget.**

`pydantic_ai_slim/pydantic_ai/result.py`, class `StreamedRunResult` (previously `AgentStream`), method `stream_output` — verbatim signature and docstring:
```python
async def stream_output(self, *, debounce_by: float | None = 0.1) -> AsyncIterator[OutputDataT]:
```
> "Stream the output as an async iterable. The pydantic validator for structured data will be called in partial mode on each iteration."

Mechanically, per the same source: as tokens/tool-call arguments accumulate, each chunk is parsed and validated with Pydantic's `experimental_allow_partial=True` mode; **partial-mode validation failures are silently caught and skipped** — verbatim from the exception handling in `AgentStream.stream_output`: `except (ValidationError, exceptions.ModelRetry): pass` — while a **final pass runs with `allow_partial=False`**, and *that* failure is not swallowed: it surfaces as `UnexpectedModelBehavior`, same as the non-streaming path. Docstring on the final-pass rationale: *"We always yield the final result even if the content matches the last partial yield, because: 1. Output validators/functions receive `partial_output=False` only on this final call, and may behave differently based on that flag."* (HIGH — verbatim, `result.py`)

**What this buys you that all-or-nothing doesn't:** the caller can consume every partial, valid-so-far snapshot of the structured object as it streams in, and only the *final* strict check can still explode — at which point you've already seen (and can log/checkpoint) every earlier valid partial state, rather than getting nothing if the very end of a 13KB payload is where it broke.

**Known rough edges (both closed, i.e. addressed, not open bugs — but evidence this mechanism has real seams):**
- GitHub #2833, "Pydantic AI cannot validate model output with `agent.iter()` / get partial thinking with `agent.run_stream()`" — closed. Reporter wanted `validate_structured_output()`-equivalent behavior when driving the lower-level `agent.iter()` API instead of `run_stream()`; raw stream events needed manual assembly.
- GitHub #3194, "Pass `allow_partial` to custom output validators" — closed. Custom `@agent.output_validator` functions originally had no visibility into whether they were being called in partial or final mode, causing false rejections on fields that hadn't finished streaming yet (e.g. a `text` field completes before a `foo` field starts).
(HIGH that these issues exist and are closed — GitHub API JSON, accessed 2026-08-09; the closed status means these specific gaps were fixed, not that the mechanism is gap-free today — I did not check whether new equivalent issues are currently open.)

### Q3 — Tool contract resolution: static or dynamic?

**Static, at tool-object construction time — which for an eagerly-registered decorator means at agent-definition time, before any run starts.**

`pydantic_ai_slim/pydantic_ai/tools.py`, `Tool.__init__`, verbatim:
```python
self.function_schema = function_schema or _function_schema.function_schema(
    function,
    schema_generator,
    tool_name=self.name,
    takes_ctx=takes_ctx,
    docstring_format=docstring_format,
    require_parameter_descriptions=require_parameter_descriptions,
)
```
`function_schema()` is called synchronously inside `Tool.__init__` — schema generation from the function's type hints happens immediately when a `Tool` object is constructed, not deferred to first call. (HIGH — verbatim, `tools.py`)

There is a separate, later step — `prepare_tool_def(ctx)` — that runs per-run and can customize or omit an *already-built* `ToolDefinition`, but it operates on the schema already generated at construction; it does not regenerate or first-generate the schema. (HIGH — verbatim signature, `tools.py`)

**Caveat (MEDIUM, not HIGH):** I confirmed `Tool.__init__` builds the schema eagerly, but I could not fetch the `@agent.tool` decorator method body itself this session (the file I expected it in, `agent/__init__.py`, was truncated in the fetch before that section) to verbatim-confirm that decoration triggers `Tool()` construction *at decoration time* as opposed to some deferred registration. Standard Python decorator idiom plus the eager `__init__` strongly implies decoration-time failure, but the direct link from "decorator applied" to "Tool() constructed" is inferred, not quoted. **For your linter design: this means a broken type hint on a `@agent.tool`-decorated function should fail the moment the containing module is imported / the Agent is constructed — no LLM call required — which is exactly the static check you're building. I'd verify this one specific link (decorator → immediate `Tool()` call) against an installed copy of the package before relying on it as a guarantee, since it's the one piece in this answer I didn't see in raw source.**

### Q4 — Usage limits and cost ceilings

**Yes — a typed, pre-flight-and-post-response-checked limits object, not a soft/advisory counter.**

`pydantic_ai_slim/pydantic_ai/usage.py`, class `UsageLimits`, verbatim:
```python
@dataclass(repr=False, kw_only=True)
class UsageLimits:
    """Limits on model usage.

    The request count is tracked by pydantic_ai, and the request limit is checked before each request to the model.
    Token counts are provided in responses from the model, and the token limits are checked after each response.

    Each of the limits can be set to `None` to disable that limit.
    """

    cost_limit: Decimal | None = None
    """The maximum cost allowed in USD."""
    request_limit: int | None = 50
    """The maximum number of requests allowed to the model."""
    tool_calls_limit: int | None = None
    """The maximum number of successful tool calls allowed to be executed."""
    input_tokens_limit: int | None = None
    """The maximum number of input/prompt tokens allowed."""
    output_tokens_limit: int | None = None
    """The maximum number of output/response tokens allowed."""
    total_tokens_limit: int | None = None
    """The maximum number of tokens allowed in requests and responses combined."""
    per_request_input_tokens_limit: int | None = None
    """The maximum number of input/prompt tokens allowed per individual request."""
    count_tokens_before_request: bool = False
```
(HIGH — verbatim, `usage.py`)

Note the default: `request_limit: int | None = 50` — i.e. even with no explicit configuration, a run is capped at 50 model requests by default. Token/cost limits default to `None` (unbounded) and must be set explicitly.

**Enforcement — raises, does not truncate.** Three checking methods, all raising `UsageLimitExceeded` (a subclass of `AgentRunError`, same exception family as the retry-exhaustion errors in Q1):
- `check_before_request()` — checked **before** each request; this is what stops a run *before* it spends more money, not after.
- `check_tokens()` — checked **after** each response, against the token limits.
- `check_per_request_input_tokens()` — checked against the per-request input cap.

`UsageLimitExceeded` itself, verbatim, `exceptions.py`:
```python
class UsageLimitExceeded(AgentRunError):
    """Error raised when a Model's usage exceeds the specified limits."""

    _HINT = (
        'Consider raising the limit, or see the docs on usage limits '
        'for budget-aware patterns: https://ai.pydantic.dev/agent/#usage-limits'
    )

    def __init__(self, message: str):
        if self._HINT not in message:
            message = f'{message.removesuffix(".")}. {self._HINT}'
        super().__init__(message)
```
(HIGH — verbatim, `exceptions.py`)

**Directly relevant to your 540k/1.58M-token runs:** the mechanism that would have stopped those runs mid-flight is `check_before_request()` — it runs *before* the next model call is dispatched, so a `total_tokens_limit` or `request_limit` set on `UsageLimits` and passed into the run would raise `UsageLimitExceeded` and halt the run at the next request boundary, not after the fact. This is a pre-flight gate, not a post-hoc budget report.

### Q5 — Evals: unit of measurement, and can deterministic + judge checks mix in one suite?

**Yes, by design — both are the same `Evaluator` interface, and a single Case or Dataset holds a flat list that can freely mix them.**

Deterministic evaluators, all verbatim class stubs from `pydantic_evals/pydantic_evals/evaluators/common.py`:
- `Equals(value, evaluation_name=None)` — "Check if the output exactly equals the provided value."
- `EqualsExpected(evaluation_name=None)` — "Check if the output exactly equals the expected output."
- `Contains(value, case_sensitive=True, as_strings=False, evaluation_name=None)` — substring/containment check.
- `IsInstance(type_name, evaluation_name=None)` — type check by name.
- `MaxDuration(seconds)` — execution-time ceiling.
- `HasMatchingSpan(query, evaluation_name=None)` — checks the OTel span tree (ties back to the Logfire/OTel instrumentation in section 5) for a matching span.

Judge-based evaluators, same file:
- `LLMJudge(rubric, model=None, include_input=False, include_expected_output=False)` — "Judge whether the output of a language model meets the criteria."
- `GEval(criteria, evaluation_steps, score_range=(1, 5), include_input=False)` — "G-Eval-style chain-of-thought evaluator (Liu et al., 2023)."

All of these are declared `class X(Evaluator[object, object, object])` — **the same generic base class**, `Evaluator[InputsT, OutputT, MetadataT]`. (HIGH — verbatim, `pydantic_evals/pydantic_evals/evaluators/common.py`)

**Mixing, confirmed in `pydantic_evals/pydantic_evals/dataset.py`:**
```python
# Case
evaluators: list[Evaluator[InputsT, OutputT, MetadataT]] = field(
    default_factory=list[Evaluator[InputsT, OutputT, MetadataT]]
)
"""Evaluators to be used just on this case."""

# Dataset
evaluators: list[Evaluator[InputsT, OutputT, MetadataT]] = []
"""List of evaluators to be used on all cases in the dataset."""
```
And the combination logic: `evaluators = case.evaluators + dataset_evaluators` — case-level and dataset-level evaluators are concatenated into one flat list and run together, with no type distinction enforced between deterministic and judge-based entries. (HIGH — verbatim, `dataset.py`)

**Directly relevant to your `verified_by: command` / `verified_by: judge` split:** pydantic-evals' prior art is exactly this — it does not model deterministic and judge checks as two subsystems. It models one `Evaluator` interface with many implementations (some deterministic, some LLM-backed), attaches a plain list of them per case (and per dataset, concatenated in), and runs the whole list uniformly. The "unit of measurement" is the `Evaluator` call itself; whether that call is a Python equality check or an LLM judge call is an implementation detail of the specific evaluator, invisible to the runner. This is a stronger prior-art match for your locked design than anything else in this brief — same shape, different syntax (Python dataclasses vs. your `verified_by:` YAML key).

---

## 5. Evals and observability

**Logfire integration** — one-line instrumentation, quote: `logfire.instrument_pydantic_ai()`. This instruments agent runs as OpenTelemetry traces with spans for each model request and tool call. Quote: *"Pydantic AI's instrumentation uses OpenTelemetry (OTel), which Logfire is based on,"* following the OTel Semantic Conventions for Generative AI systems. (HIGH — pydantic.dev/docs/ai/logfire/)

**Cost/token tracking is automatic** once instrumented: emits `gen_ai.client.token.usage` (tokens per request, by type) and `operation.cost` (estimated USD cost per model/embedding request, "recorded when a price is known for the model"). (HIGH, quoted)

**Pydantic Evals** is a *separate* package (`pydantic-evals` on PyPI, source at `pydantic_evals/` in the same monorepo — confirmed by directly fetching `pydantic_evals/pydantic_evals/evaluators/common.py` and `pydantic_evals/pydantic_evals/dataset.py` this session, see section 4 Q5), code-first (evals defined in Python, not a web UI), and — notably — **does not depend on pydantic-ai itself**; it has only an optional dependency on `logfire` if you want OTel traces from your evals. This means Evals is usable standalone even outside a pydantic-ai agent stack. (Package-independence claim: MEDIUM — WebSearch synthesis, not re-verified against `pyproject.toml` this session. Evaluator class shapes: HIGH — verbatim, see section 4 Q5.)

---

## 6. Multi-agent and durability

**Three documented multi-agent patterns** (quoted): (1) **Agent delegation** — "Agents using another agent via tools," where the delegating agent retains control when the delegate finishes; (2) **Programmatic hand-off** — multiple agents called in succession, with application code and/or a human deciding which agent runs next; (3) **Graph-based control flow** — `pydantic-graph`, a graph/state-machine package for complex multi-agent execution. (HIGH — pydantic.dev/docs/ai/multi-agent-applications/)

**Subagents spawning subagents:** the fetch surfaced a "Deep Agents" reference — *"Task delegation — spawning specialized sub-agents for specific tasks, with isolated context to prevent recursive delegation issues"* — implying recursive spawning is possible but the framework provides isolated-context guardrails against it running away. **I flag this at LOW-MEDIUM confidence**: I did not independently verify with a direct quote that this text lives on the pydantic-ai docs page specifically (as opposed to being conflated by the summarizer with the general industry "Deep Agents" pattern popularized elsewhere). Verify directly before relying on it.

**Durable execution — four officially co-maintained integrations**, quoted structure: Temporal, DBOS, Prefect ship "as capabilities you attach to an agent" (first-party); Restate "lives in the Restate SDK and builds only on Pydantic AI's public interface" (external but sanctioned). Additional unofficial/external integrations mentioned: Kitaru, Apache Airflow. Docs describe this as production-grade: agents "preserve their progress across transient API failures and application errors or restarts." (HIGH for the Temporal quote and the "four durable execution solutions" framing; MEDIUM for Kitaru/Airflow which were listed without a supporting quote — pydantic.dev/docs/ai/durable-execution/overview/)

**Human-in-the-loop:** built-in approval workflows for "dangerous operations like code execution or file deletion," documented under "Requiring Tool Approval." (HIGH, quoted)

**MCP support — both directions.** As a client, agents attach MCP servers via the v2 Capability system:
```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import MCP

agent = Agent(
    'openai:gpt-5.2',
    capabilities=[
        MCP(url='https://mcp.example.com/api'),
        MCP(url='https://mcp.example.com/other', native=True),
    ],
)
```
with a lower-level `MCPToolset` also available via `toolsets=[...]`. As a server, docs confirm "Agents can be used within MCP servers" and link out to separate server docs, but I did not pull the server-side class names (e.g., no `MCPServerStdio`/`MCPServerSSE`-equivalent confirmed this session — those may be legacy v1 names that changed under the v2 Capability refactor). (MEDIUM — client side is internally consistent with the confirmed v2 Capabilities pattern, code shown is paraphrase-derived not a raw quote; server side is a title-only confirmation, not a code example.)

---

## 7. Model support

**Officially supported providers** (first-class model classes): OpenAI, Anthropic, Google Gemini (two APIs), xAI, AWS Bedrock, Cerebras, Cohere, Groq, Hugging Face, Mistral, OpenRouter, Z.AI — plus a generic OpenAI-compatible path covering DeepSeek, Ollama, Together AI, and similar. (HIGH — pydantic.dev/docs/ai/models/overview/, paraphrase but consistent with known dedicated classes `OpenAIChatModel` / `AnthropicModel` named explicitly)

**Anthropic is first-class**, not a bolt-on: dedicated `AnthropicModel` class, equal billing alongside `OpenAIChatModel` in the docs, framework markets itself as model-agnostic. (HIGH)

**Model string format:** `"<provider>:<model-name>"`, e.g. `"openai:gpt-5.2"`, `"anthropic:claude-sonnet-4-5"`, `"openrouter:google/gemini-3-pro-preview"`. (MEDIUM — the format itself is well-established/HIGH from my own prior knowledge of the library, but these exact example strings are the docs' current illustrative choices, not verified against a live model registry.)

**Fallback/routing**, quoted class usage:
```python
from pydantic_ai.models.fallback import FallbackModel

fallback_model = FallbackModel(openai_model, anthropic_model)
agent = Agent(fallback_model)
```
`FallbackModel` "attempt[s] multiple models in sequence until one succeeds," advancing on either an exception or "when the response content indicates a semantic failure." (HIGH — direct quote, pydantic.dev/docs/ai/models/overview/)

---

## 8. Honest weaknesses

Pulled directly from the GitHub issue tracker (raw JSON via GitHub API, sorted by reactions), so these are real community-reported pain points, not inferred. Reaction counts are approximate (extracted via a summarizing pass over the JSON, not eyeballed row-by-row) — treat counts as "roughly this popular," not exact.

| Issue | # | State | Reactions (approx.) | What it signals |
|---|---|---|---|---|
| Structured outputs as an alternative to Tool Calling | #582 | Closed | 50 | Early gap — tool-call-based structured output has provider-schema inconsistencies (e.g. Gemini function-declaration constraints); this is now addressed by "Native Output" mode (section 4) but shows the tool-call approach isn't universally clean across providers |
| Vector search / embeddings API | #58 | Closed | 41 | Framework originally had no first-party embeddings story |
| LiteLLM as a model wrapper | #1496 | Closed | 38 | Demand for provider-abstraction beyond the built-in provider list |
| Parallel node execution in Graphs ("Graphs V2") | #704 | Closed | 36 | `pydantic-graph` originally lacked parallel execution — a real limitation for fan-out workflows |
| Prompt caching support | #138 | Closed | 35 | Missing at launch, now closed/shipped |
| Toolsets, OpenAPI, MCP | #110 | Closed | 34 | MCP support (section 6) was a late addition, not present from day one |
| AWS Bedrock support | #118 | Closed | 32 | Same pattern — provider coverage lagged demand |
| **Batch processing support** | **#1771** | **OPEN** | 32 | Live gap as of research date — no first-party batch-API support (cost-saving batch modes from OpenAI/Anthropic), despite real user demand |
| Anthropic prompt caching | #1041 | Closed | 26 | — |
| Anthropic support itself | #63 | Closed | 24 | Anthropic wasn't even supported at launch — worth knowing given Beamix's Claude-heavy stack; it has clearly matured since (now first-class per section 7), but the framework's Anthropic support is not as old as its OpenAI support |
| MCP resources support | #1783 | Closed | 24 | — |
| **OpenAI Realtime API support** | **#1447** | **OPEN** | 23 | Live gap — no realtime/voice support as of research date |
| Validate model output with `agent.iter()` / partial thinking with `run_stream()` | #2833 | Closed | — (found via targeted search, section 4 Q2) | Partial-mode streaming validation had real seams around the lower-level `iter()` API |
| Pass `allow_partial` to custom output validators | #3194 | Closed | — (section 4 Q2) | Custom output validators originally couldn't tell partial-mode from final-mode, causing false rejections mid-stream |

(HIGH confidence that these issues exist with roughly these topics/states — GitHub API JSON, accessed 2026-08-09; MEDIUM on exact reaction numbers due to the summarization step.)

**Synthesized weaknesses, not from a single citation but consistent across the above:**
- **Provider-coverage lag pattern.** Repeatedly, major providers (Anthropic, Bedrock) and major capabilities (MCP, prompt caching, embeddings) were *not* present at launch and were added reactively to community demand. The framework is comprehensive *now* but has a track record of shipping the core loop first and filling gaps under pressure — consistent with the stated "leaner core" philosophy in section 1, but worth knowing if Beamix needs a capability that isn't in the current list (e.g., batch processing, currently open).
- **Near-daily release cadence is a double-edged signal** (section 2): very responsive, but a team pinning a specific version for production stability should expect to actively manage upgrades rather than "set and forget," especially given the v1/v2 split currently in flight.
- **The partial-validation streaming mechanism (section 4, Q2) has a history of edge-case bugs around exactly the boundary that matters most** — telling a custom validator or a lower-level iteration API whether it's mid-stream or final. Both found issues are closed, but their existence means "stream + partial-validate" is not a mechanism that was correct on the first attempt; if Beamix builds an equivalent, budget for the same class of edge case (a check running in "partial" context needs to know it's partial).
- **I did not find, and did not fabricate, any qualitative "why we left" migration testimonials** (e.g., specific teams saying "we moved off Pydantic AI to X because Y") — I searched for this implicitly via the comparison articles in section 9 and none surfaced a documented migration-away story with attribution. This is a genuine gap, not an oversight: label it UNKNOWN.

---

## 9. Comparisons

**Sourcing caveat for this section only:** these come from third-party comparison/SEO content sites (ZenML, Ertas AI, AltAI, aicoolies.com, xpay.sh, kunalganglani.com), several of which read as programmatically-generated comparison content rather than hands-on benchmarks. Treat directional claims as MEDIUM and any specific number (e.g., latency in ms) as LOW — I have not independently reproduced any of these benchmarks.

**vs LangGraph:** Common framing across multiple sources — LangGraph predates Pydantic AI (early 2024 vs mid-2024) and matured inside the LangChain ecosystem with a graph-first, durability/checkpointing-heavy design; Pydantic AI prioritizes developer ergonomics and a lighter runtime. Recommendation pattern across sources: start with Pydantic AI for mostly-linear agents (input → a few tool calls → structured output), graduate to LangGraph when you need explicit state machines, branching, and durable checkpointing at the orchestration level. One source claims a hybrid pattern is gaining traction — Pydantic AI for defining what a single agent does, LangGraph for routing between agents/shared state. A specific latency benchmark (LangGraph ~10,155ms vs 5,700-7,000ms for "leaner frameworks") appeared in one source with no methodology given — LOW confidence, do not cite the number externally. (MEDIUM overall for the qualitative framing, LOW for any number)

**vs Claude Agent SDK:** Sources agree these are not really competitors — Pydantic AI supports Claude as one of several first-class providers (section 7), so the comparison is "typed multi-provider framework" vs "Anthropic's own opinionated single-vendor SDK." Claude Agent SDK is described as faster to prototype with and better suited when the agent needs to inspect/edit a codebase, run shell commands, and work autonomously over many steps Claude-Code-style, and it has its own native subagent-delegation support. Pydantic AI is described as cleaner when you need typed agent logic, structured outputs enforced via Pydantic validation, dependency injection, and the ability to swap model providers. One source's framing: Claude Agent SDK is "fast to build but slow and token-heavy at scale," Pydantic AI trades some of that build speed for more structural control. (MEDIUM — directionally plausible and consistent with each tool's documented design center, but this exact framing is one blogger's synthesis, not a primary-source claim from either vendor.)

**vs plain provider SDKs (e.g., the raw OpenAI/Anthropic Python SDKs):** not covered by a dedicated source this session — I did not find a direct comparison article and did not fabricate one. What can be said from primary-source facts already gathered: a plain SDK gives you no validation, no typed dependency injection, no built-in retry-on-validation-failure loop, and no `pydantic-graph`/durable-execution/Capabilities layer — you'd hand-roll all of section 4's `ModelRetry` behavior yourself. Pydantic AI's value proposition over a raw SDK is precisely that retry-and-validate loop plus multi-provider portability. (This paragraph is my own synthesis from confirmed facts elsewhere in this brief, not a new external source — labeled as such, not cited as an external claim.)

---

## 10. TypeScript reality check

**There is no official or credible TS/JS port of Pydantic AI.** Multiple searches converged on the same answer: the framework is Python-only. (MEDIUM-HIGH — absence-of-evidence across a dedicated WebSearch pass, plus no port is mentioned anywhere in the primary docs I read)

**Nearest analog in the TS ecosystem is the Vercel AI SDK** — but it is a different tool with a different design center: "TypeScript-first toolkit for building streaming-first AI UIs," oriented at React/Next.js/Svelte developers, with hooks like `useChat`/`useCompletion` and multi-provider streaming. It has tool-calling with error repair, but it is not a drop-in equivalent to Pydantic AI's typed-agent/dependency-injection/graph/durable-execution stack — one comparison source explicitly frames Vercel AI SDK as winning for "ChatGPT-like web app" UI work and Pydantic AI as winning for something like "a bank's fraud-detection agent" where type safety and auditability matter more than UI polish. (MEDIUM — third-party framing, but directionally consistent with what each SDK is documented to actually do)

**Plain statement for Beamix:** this section's original framing was "should we adopt Pydantic AI" — per the updated lens, that's moot; this brief is prior art, not a proposal. All five mechanisms in section 4 (retry-exhaustion exceptions, `RetryPromptPart` formatting, eager tool-schema construction, partial-mode streaming validation, `UsageLimits`) are concepts, not Python-specific tricks — every one of them is portable to a Claude-Code/TypeScript harness without needing the library or the runtime.

---

## 11. Mechanism answers

Compact, explicit restatement of the five questions, positioned here per team-lead's structural request. No new research below — every claim here is a pointer back into section 4, where the full verbatim source quotes, file paths, and caveats live. Read section 4 for the evidence; read this section for the answer in one paragraph.

**1. Validation-failure message — what exactly is sent back to the model?** (HIGH — verbatim quote in §4 Q1) Not raw Pydantic error text, and not a free-form summary — a fixed, code-level template. `RetryPromptPart.model_response()` renders a list of Pydantic `ErrorDetails` as `"{N} validation error(s):\n\`\`\`json\n{indented JSON, with ctx/input fields stripped}\n\`\`\`\n\nFix the errors and try again."`; a string-based `ModelRetry` message renders as `"Validation feedback:\n{message}"` (or just the raw message when a `tool_name` is present) with the same `"Fix the errors and try again."` tail appended. Every retry, regardless of what triggered it, ends in that identical sentence — one deterministic formatter, not per-call-site strings.

**2. Oversized structured output — the one you flagged as possibly uncovered.** (HIGH — §4 Q2) It is covered, and the answer is a plain "yes, there is a size-specific mechanism, and it is not the retry loop." `ModelRetry`/retry-and-refeed addresses *malformed* output — wrong shape, wrong type, a field that doesn't satisfy a constraint — and re-running generation from scratch is genuinely the wrong tool for *oversized* output, since a retry just repeats the same all-or-nothing attempt and burns budget, exactly the failure mode you described. The actual size-specific mechanism is architectural, not retry-based: `StreamedRunResult.stream_output()` validates every incoming chunk in Pydantic's `allow_partial=True` mode, silently discards partial-mode failures (`except (ValidationError, ModelRetry): pass`), and only runs one strict `allow_partial=False` check on the final chunk — so a 13KB payload is consumed incrementally as valid partial snapshots rather than parsed all at once at the end. Three-sentence version for your return message is below.

**3. Tool-contract resolution — static or dynamic?** (HIGH mechanism / MEDIUM decorator-link — §4 Q3) Static. `Tool.__init__` calls `function_schema()` synchronously at construction to build the JSON schema from the function's type hints — a broken type hint fails there, at agent-definition time, before any run or LLM call. One gap, flagged not glossed: I could not verbatim-confirm from source that the `@agent.tool` decorator itself calls `Tool()` immediately at decoration time (the file fetch was truncated before that section) — inferred from the eager `__init__` and standard decorator idiom, not quoted. Verify that one link before treating it as a guarantee for the linter.

**4. Usage limits — hard ceiling object, raise or truncate?** (HIGH — §4 Q4) Raise, never truncate. `UsageLimits` is a typed dataclass (`request_limit` defaults to 50 even with no config; `cost_limit`, `tool_calls_limit`, and per-type token limits default to `None`/unbounded). `check_before_request()` runs pre-flight, before the next model call is even dispatched; `check_tokens()` runs post-response. Both raise `UsageLimitExceeded`, a real exception that halts the run — this is a pre-flight gate, not a post-hoc report, which is the part directly relevant to stopping a run before it reaches 540k or 1.58M tokens.

**5. Evals — can one suite mix deterministic and judge checks?** (HIGH — §4 Q5) Yes, by construction, and this is the strongest prior-art match in the whole brief for your locked design. Deterministic evaluators (`Equals`, `Contains`, `IsInstance`, `MaxDuration`) and judge-based evaluators (`LLMJudge`, `GEval`) all subclass one generic `Evaluator[InputsT, OutputT, MetadataT]`. `Case.evaluators` and `Dataset.evaluators` are both plain `list[Evaluator]` fields, concatenated (`case.evaluators + dataset_evaluators`) and run together with zero type distinction at the runner level — the exact shape of a `verified_by: command` / `verified_by: judge` split expressed as one interface with two implementations.

---

## 12. Mechanisms worth stealing

Six mechanisms, each with an exact implementation location and the one-line enforcement it would give a Claude-Code-based agent harness.

1. **Retry-exhaustion raises a typed exception, never returns empty.** `pydantic_ai_slim/pydantic_ai/tool_manager.py::ToolManager._check_max_retries` and `pydantic_ai_slim/pydantic_ai/_agent_graph.py::consume_output_retry` both raise `UnexpectedModelBehavior` with a specific message on exhaustion, rather than returning `None`/silently truncating. **Would enforce:** treat "retries exhausted" as a distinct, loud failure envelope in the harness — the exact bug class that produced 12 agents returning nothing.

2. **The retry-prompt text is one deterministic formatter, not ad hoc strings per call site.** `pydantic_ai_slim/pydantic_ai/messages.py::RetryPromptPart.model_response()` — serializes validation errors to indented JSON, pluralizes the count, and always appends the same literal instruction. **Would enforce:** one shared function that formats every validation-failure message sent back to a model, so retries look identical regardless of which check triggered them.

3. **Tool/capability schemas are built at declaration time, not call time.** `pydantic_ai_slim/pydantic_ai/tools.py::Tool.__init__` calls `_function_schema.function_schema(...)` synchronously in the constructor. **Would enforce:** the planned build-linter can instantiate every declared agent/tool without an LLM call and get an immediate, deterministic failure if a declared capability doesn't resolve — exactly the static check being designed.

4. **Large structured output is streamed and validated incrementally, with partial failures swallowed until one final strict check.** `pydantic_ai_slim/pydantic_ai/result.py::StreamedRunResult.stream_output` — `allow_partial=True` on every chunk (`except (ValidationError, ModelRetry): pass`), `allow_partial=False` only on the last pass. **Would enforce:** for the 13KB-payload failure mode, stream + partial-validate so everything that parsed successfully before the break point is preserved and consumable, instead of an all-or-nothing single-shot parse.

5. **Usage ceilings are a typed object checked before the next request is dispatched, not a post-hoc report.** `pydantic_ai_slim/pydantic_ai/usage.py::UsageLimits` (`request_limit`, `cost_limit`, `tool_calls_limit`, token limits) with `check_before_request()` run pre-flight and `check_tokens()` post-response, both raising `UsageLimitExceeded`. **Would enforce:** the planned "STALLED" envelope should gate *before* each step (request/tool-call/token ceilings checked pre-flight), stopping a run heading toward the 540k/1.58M-token pattern mid-flight rather than after the spend.

6. **Deterministic and judge-based checks are one interface, concatenated into one list, not two subsystems.** `pydantic_evals/pydantic_evals/evaluators/common.py` (deterministic: `Equals`, `Contains`, `IsInstance`, `MaxDuration`; judge-based: `LLMJudge`, `GEval` — all subclass one generic `Evaluator[InputsT, OutputT, MetadataT]`) plus `pydantic_evals/pydantic_evals/dataset.py::Case.evaluators` / `Dataset.evaluators`, combined via `case.evaluators + dataset_evaluators`. **Would enforce:** the locked `verified_by: command` / `verified_by: judge` split can be modeled as one `Evaluator`-style interface with two implementations, run together in a single pass over a case — matches this prior art exactly, just different syntax (dataclasses vs. YAML key).

---

## Gaps / UNKNOWN (consolidated)

- Exact day-level date for the v2.0 stable release (have "June 23, 2026" from a search-summary citation, not a verbatim primary quote).
- Exact agent/run-level retry-config signature: is it `retries=N` (int) or `retries={'output': N}` (dict) on `Agent(...)`/`agent.run(...)`? The exhaustion *mechanism* (section 4, Q1) is HIGH from source; this specific configuration call shape is MEDIUM (docs paraphrase only, not re-verified against source this pass).
- Whether `@agent.tool` decoration itself synchronously constructs a `Tool()` at decoration time (vs. some deferred path) — `Tool.__init__`'s eager schema build is HIGH/verbatim, but the decorator-to-constructor link specifically was not found in raw source this session (file fetch was truncated before that section). Flagged in section 4, Q3, and section 11.
- Pydantic Evals' independence from pydantic-ai (no dependency) — MEDIUM, WebSearch synthesis, not re-verified against `pyproject.toml`.
- MCP server-side class names (the "expose pydantic-ai agents as an MCP server" direction) — confirmed to exist, not confirmed in code detail.
- "Deep Agents" / recursive subagent-spawning claim in section 6 — flagged LOW-MEDIUM, needs a direct-quote re-check.
- Funding figures ($4.7M seed / $17.2M total) — could not confirm these are 2026-current rather than an older round being resurfaced by an aggregator.
- Context7 MCP was unavailable in this session (no `mcp__context7__*` tools exposed to this agent) — the brief's tier-1 source per the research skill was skipped by necessity, not choice.
- All raw-source quotes in section 4 were fetched against the `main` branch on 2026-08-09, not a pinned commit SHA — this is a near-daily-release repo, so re-verify against a specific tag/SHA before treating any exact string (error messages, defaults) as permanently stable.

---

## Sources

- https://pydantic.dev/docs/ai/overview/ (redirect target of ai.pydantic.dev)
- https://api.github.com/repos/pydantic/pydantic-ai/releases
- https://api.github.com/repos/pydantic/pydantic-ai
- https://github.com/pydantic/pydantic-ai (README)
- https://pydantic.dev/docs/ai/project/version-policy/
- https://pydantic.dev/articles/pydantic-ai-v2
- https://pydantic.dev/docs/ai/agents/
- https://pydantic.dev/docs/ai/output/
- https://pydantic.dev/docs/ai/logfire/
- https://pydantic.dev/docs/ai/multi-agent-applications/
- https://pydantic.dev/docs/ai/mcp/overview/
- https://pydantic.dev/docs/ai/models/overview/
- https://pydantic.dev/docs/ai/durable-execution/overview/
- https://pydantic.dev/docs/ai/project/changelog/ (referenced, not independently fetched)
- https://pypi.org/project/pydantic-evals/ (referenced via search)
- GitHub issue search: `repo:pydantic/pydantic-ai is:issue sort:reactions-+1-desc` via GitHub API
- https://api.github.com/repos/pydantic/pydantic-ai/issues/2833
- https://api.github.com/repos/pydantic/pydantic-ai/issues/3194
- https://api.github.com/repos/pydantic/pydantic-ai/contents/pydantic_ai_slim/pydantic_ai (directory listing, used to locate `tool_manager.py`)
- **Raw source (addendum, 2026-08-09, fetched from `main`):**
  - `raw.githubusercontent.com/pydantic/pydantic-ai/main/pydantic_ai_slim/pydantic_ai/exceptions.py` — `ModelRetry`, `UnexpectedModelBehavior`, `UsageLimitExceeded`
  - `raw.githubusercontent.com/pydantic/pydantic-ai/main/pydantic_ai_slim/pydantic_ai/usage.py` — `UsageLimits`
  - `raw.githubusercontent.com/pydantic/pydantic-ai/main/pydantic_ai_slim/pydantic_ai/messages.py` — `RetryPromptPart`
  - `raw.githubusercontent.com/pydantic/pydantic-ai/main/pydantic_ai_slim/pydantic_ai/tools.py` — `Tool.__init__` (eager schema build)
  - `raw.githubusercontent.com/pydantic/pydantic-ai/main/pydantic_ai_slim/pydantic_ai/tool_manager.py` — `_check_max_retries`, `default_max_retries`
  - `raw.githubusercontent.com/pydantic/pydantic-ai/main/pydantic_ai_slim/pydantic_ai/_agent_graph.py` — `consume_output_retry`
  - `raw.githubusercontent.com/pydantic/pydantic-ai/main/pydantic_ai_slim/pydantic_ai/result.py` — `StreamedRunResult.stream_output`/`stream_response`, partial-validation exception handling
  - `raw.githubusercontent.com/pydantic/pydantic-ai/main/pydantic_evals/pydantic_evals/evaluators/common.py` — `Equals`, `EqualsExpected`, `Contains`, `IsInstance`, `MaxDuration`, `HasMatchingSpan`, `LLMJudge`, `GEval`
  - `raw.githubusercontent.com/pydantic/pydantic-ai/main/pydantic_evals/pydantic_evals/dataset.py` — `Case.evaluators`, `Dataset.evaluators`, combination logic
  - `raw.githubusercontent.com/pydantic/pydantic-ai/main/pydantic_ai_slim/pydantic_ai/agent/__init__.py` — attempted fetch for `@agent.tool` decorator body, truncated before the relevant section (see Gaps)
- WebSearch: "pydantic-ai vs LangGraph comparison 2026" (ZenML, Ertas AI, AltAI, aicoolies.com, xpay.sh, aiagentskit.com, kunalganglani.com)
- WebSearch: "pydantic-ai vs Claude Agent SDK Anthropic comparison" (lowcode.agency, sourceforge, rasa.com, morphllm.com, mindstudio.ai)
- WebSearch: "pydantic-ai TypeScript JavaScript port equivalent" (dev.to, npmjs.com/org/pydantic, phillipdupuis/pydantic-to-typescript)
- WebSearch: "Pydantic Services Inc funding Samuel Colvin pydantic-ai 2026" (Tracxn, Crunchbase, pydantic.dev/articles/company-announcement)
- WebSearch: "pydantic-ai streaming structured output partial validation allow_partial stream_structured" (DeepWiki, GitHub issues #2833/#3194, pydantic.dev/docs/ai/core-concepts/output/)
- WebSearch: "pydantic-ai Pydantic Evals package documentation" (DeepWiki, GitHub, PyPI)
- https://pypi.org/pypi/pydantic-ai/json and https://pypi.org/project/pydantic-ai/ (used for cross-check; the raw PyPI JSON fetch returned an internally inconsistent summary — current version 2.27.0 next to a stale releases list ending at 0.0.55/April 2025 — treated as unreliable and superseded by the direct GitHub API releases call)
