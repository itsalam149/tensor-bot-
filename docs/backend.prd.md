# Tensor Bot MVP Backend PRD

## 1. Overview

Tensor Bot is a SaaS product that lets a business create an AI chatbot trained on its own content. The MVP backend must support the end-to-end lifecycle of a bot: creating a bot, adding website and file sources, extracting and processing content into a knowledge base, embedding the data, and serving retrieval-backed answers through a chat widget and playground.

The backend should be designed as a clean ingestion and retrieval pipeline so that future sources such as Notion, Google Drive, Slack, and APIs can be added without redesigning the core system.

---

## 2. Product Goal

Build a backend MVP that can:

* ingest website URLs and uploaded documents
* extract and normalize content
* chunk and embed content
* store searchable knowledge chunks
* answer user questions using retrieval augmented generation
* expose processing status and logs to the dashboard
* support a deployable embed widget for testing and production use

---

## 3. Success Criteria

The MVP is successful if a user can:

1. create a bot
2. add a website or upload a PDF/DOCX/TXT file
3. see the source finish processing successfully
4. ask a question in the playground
5. receive an answer grounded in the uploaded or scraped content
6. embed the bot widget on a website and get the same behavior there

Primary backend metrics:

* source ingestion success rate
* average processing time per source
* answer retrieval latency
* answer relevance feedback rate
* failed job recovery rate

---

## 4. MVP Scope

### In scope

* Bot creation and management
* Website scraping from a user-provided URL
* File uploads: PDF, DOCX, TXT
* Content extraction and normalization
* Chunking pipeline
* Embedding generation
* Vector storage and retrieval
* Knowledge base indexing per bot
* Playground chat API
* Widget chat API
* Processing status tracking
* Re-sync / reprocess for a source
* Basic usage logging and error tracking

### Out of scope for MVP

* Multi-tenant enterprise permissions
* Team roles and advanced access control
* Complex live integrations like Slack, Drive, Notion, GitHub
* Fine-tuning models
* Multi-language auto-translation
* Human handoff workflows
* Billing automation beyond basic plan enforcement
* Advanced analytics dashboard

---

## 5. Assumptions

* Each bot belongs to one workspace or one account for MVP simplicity.
* A source belongs to exactly one bot.
* All source content is transformed into a unified chunk format.
* Retrieval uses a vector database with optional metadata filters.
* The first release only needs one response model and one embedding model.
* Website scraping can be delegated to a third-party crawler API for reliability.
* Processing can be asynchronous and job-based.

---

## 6. Users and Personas

### Bot Owner

A business user who creates the bot, uploads content, checks status, and tests answers.

### End Visitor

A website visitor who interacts with the embedded widget and asks questions.

### Admin/Internal Operator

A system operator who monitors jobs, retries failures, and inspects logs.

---

## 7. Core User Flows

### Flow A: Create bot

1. User submits bot name and optional description.
2. Backend creates bot record.
3. Bot is returned in a ready state.

### Flow B: Add website source

1. User submits a URL.
2. Backend validates and normalizes the URL.
3. Source record is created in pending state.
4. Background job crawls pages and extracts content.
5. Content is cleaned, chunked, embedded, and stored.
6. Source status changes to completed or failed.

### Flow C: Upload file source

1. User uploads PDF, DOCX, or TXT file.
2. Backend stores raw file.
3. Background job extracts text.
4. Text is cleaned, chunked, embedded, and stored.
5. Source status changes to completed or failed.

### Flow D: Ask a question

1. User enters a question in playground or widget.
2. Backend embeds the query.
3. Backend retrieves top matching chunks.
4. Prompt is built with retrieved context.
5. LLM generates an answer.
6. Response includes answer and optionally source references.

---

## 8. Functional Requirements

## 8.1 Bot Management

### Requirements

* Create bot
* Update bot name and description
* List bots
* Delete bot
* Generate a public bot identifier for widget use

### Acceptance Criteria

* A bot can be created in under 1 second.
* Bot records are unique per account/workspace.
* Bot deletion removes or disables access to associated sources and vectors.

---

## 8.2 Source Management

### Source types for MVP

* website
* file

### Requirements

* Create source
* View source status
* List sources for a bot
* Retry source processing
* Delete a source

### Source states

* pending
* crawling
* extracting
* chunking
* embedding
* completed
* failed

### Acceptance Criteria

* Every source has a visible lifecycle state.
* Failures preserve error messages and timestamps.

---

## 8.3 Website Scraping

### Requirements

* Accept a URL
* Validate URL format and allowed protocols
* Normalize URL and prevent duplicates when possible
* Crawl main pages and linked pages within defined limits
* Extract main content and metadata
* Ignore irrelevant assets such as images, scripts, and styles

### MVP crawling policy

* Maximum pages per site: configurable, default 50
* Maximum depth: configurable, default 2 or 3
* Same-domain only
* Respect basic robots policy where feasible
* Skip obvious duplicate or thin content pages

### Output

* page URL
* title
* markdown/plain text content
* metadata such as headings, description, and crawl timestamp

### Acceptance Criteria

* A valid website source produces normalized text chunks.
* Crawl failures are logged and shown in source status.

---

## 8.4 File Uploads

### Supported formats

* PDF
* DOCX
* TXT

### Requirements

* Upload file securely
* Store original file
* Extract text from file
* Handle invalid or encrypted files gracefully
* Track file size and type

### Acceptance Criteria

* File upload produces an extractable text representation or an error state.
* Each file is tied to a single source record.

---

## 8.5 Content Normalization

### Requirements

* Remove repeated headers/footers when possible
* Normalize whitespace
* Collapse junk characters and boilerplate
* Preserve semantic structure such as headings and paragraphs
* Attach source metadata to every extracted unit

### Acceptance Criteria

* Output is consistent regardless of whether it came from a website or file.
* Downstream chunking receives clean text, not raw HTML or binary data.

---

## 8.6 Chunking

### Requirements

* Split content into semantically useful chunks
* Preserve source references and section metadata
* Support chunk overlap
* Avoid oversized chunks that reduce retrieval quality

### Default chunking policy

* chunk size: about 800–1200 tokens or equivalent text length
* overlap: about 100–200 tokens
* split preference: heading, paragraph, sentence, then fallback split

### Acceptance Criteria

* Chunks are deterministic for the same input.
* Every chunk can be traced back to a source and page/file location.

---

## 8.7 Embeddings

### Requirements

* Generate embeddings for every chunk
* Generate query embeddings at runtime
* Support a single embedding model for MVP
* Store vector references and model metadata

### Acceptance Criteria

* Chunks are queryable by semantic similarity.
* Re-embedding can be done when model changes.

---

## 8.8 Knowledge Base

### Requirements

* Build a bot-level knowledge base from all processed sources
* Support incremental updates when a source is added, retried, or deleted
* Maintain chunk metadata for filtering and citations

### Acceptance Criteria

* Each bot has an isolated knowledge space.
* Deleted sources no longer contribute to retrieval.

---

## 8.9 Retrieval and Answer Generation

### Requirements

* Embed user query
* Retrieve top-k relevant chunks
* Optional metadata filtering by bot/source
* Build prompt with instructions, context, and question
* Call LLM for answer generation
* Return answer plus source metadata when available

### Retrieval policy

* default top-k: 5 to 8 chunks
* optional reranking can be added later
* fallback behavior when retrieval is weak: answer with low-confidence wording or request clarification

### Acceptance Criteria

* Answers are grounded in the ingested content where possible.
* Retrieved chunk references are traceable in logs.

---

## 8.10 Playground Chat API

### Requirements

* Allow bot owners to test responses before deploying
* Persist conversation thread optionally for MVP or keep it stateless
* Show source snippets used in the answer
* Return latency and processing status

### Acceptance Criteria

* Playground works independently of the widget.
* Owners can verify whether the bot is ready.

---

## 8.11 Widget Chat API

### Requirements

* Public read-only access through bot identifier and token or signed key
* Rate limiting
* Session or conversation identifiers
* Same retrieval and generation behavior as playground

### Acceptance Criteria

* Widget can be embedded on external sites securely.
* Public requests do not expose private source data directly.

---

## 8.12 Re-sync / Reprocess

### Requirements

* Reprocess a source on demand
* Preserve historical source versions if feasible, or overwrite with latest for MVP
* Remove old chunks before indexing new content to avoid duplication

### Acceptance Criteria

* A retry or sync action replaces stale content cleanly.

---

## 9. Non-Functional Requirements

### Performance

* Source creation API should respond quickly and defer heavy work to background jobs.
* Playground answers should be generated within a target latency that feels interactive.
* Ingestion jobs should be resumable and idempotent.

### Reliability

* Failed jobs should not corrupt the knowledge base.
* Partial ingestion should be recoverable.
* Duplicate retries should not duplicate vectors.

### Security

* Validate all uploaded files.
* Sanitize extracted content.
* Prevent SSRF in website crawling.
* Restrict crawl scope.
* Separate public widget access from private dashboard access.
* Secure secrets and API keys.

### Observability

* Log every job step
* Track source status and error reasons
* Record retrieval latency and LLM latency
* Store basic metrics for source success and answer usage

### Scalability

* Support incremental growth from a handful of bots to hundreds or thousands of bots without architecture changes.
* Use queue-based workers for processing rather than synchronous web requests.

---

## 10. Proposed Backend Architecture

### Services

1. API Server
2. Background Job Worker
3. Crawler/Extractor Adapter
4. File Parser Service
5. Chunking and Embedding Pipeline
6. Retrieval Service
7. Chat Response Orchestrator

### Suggested deployment shape for MVP

* Single monorepo
* Next.js frontend + API routes or separate backend service
* Background worker process for ingestion jobs
* Postgres database
* Object storage for files
* Vector search using pgvector or a dedicated vector DB
* External APIs for crawling, embeddings, and chat generation

### Architectural principle

All source types should eventually converge into one internal representation:

* raw source record
* extracted document text
* chunk records
* embeddings
* retrieval metadata

---

## 11. Data Model

### Bot

* id
* owner_id or workspace_id
* name
* description
* public_identifier
* status
* created_at
* updated_at

### Source

* id
* bot_id
* type
* status
* input_url or file_url
* file_name
* file_type
* crawl_config
* error_message
* processed_at
* created_at
* updated_at

### Document

Represents one extracted page or file unit.

* id
* source_id
* bot_id
* title
* content
* metadata_json
* origin_url or file_path
* created_at

### Chunk

* id
* document_id
* source_id
* bot_id
* chunk_index
* content
* metadata_json
* embedding_status
* created_at

### Embedding

* id
* chunk_id
* model_name
* vector_reference or vector_payload
* created_at

### Chat Session

* id
* bot_id
* visitor_session_id
* source
* created_at

### Chat Message

* id
* session_id
* role
* content
* sources_used_json
* latency_ms
* created_at

### Job

* id
* source_id
* job_type
* status
* attempt_count
* error_message
* started_at
* finished_at
* created_at

---

## 12. API Design

## 12.1 Bot APIs

* POST /bots
* GET /bots
* GET /bots/:id
* PATCH /bots/:id
* DELETE /bots/:id

## 12.2 Source APIs

* POST /bots/:id/sources
* GET /bots/:id/sources
* GET /sources/:id
* POST /sources/:id/retry
* DELETE /sources/:id

## 12.3 File Upload APIs

* POST /uploads/presign or multipart upload endpoint
* POST /sources/:id/attach-file

## 12.4 Retrieval APIs

* POST /bots/:id/chat
* POST /bots/:id/playground-chat
* GET /sessions/:id/messages

## 12.5 Status APIs

* GET /sources/:id/status
* GET /jobs/:id
* GET /bots/:id/usage

---

## 13. Job Pipeline Design

### Job 1: Ingest Source

Trigger: source created
Output: crawl or file extraction started

### Job 2: Extract Content

For website: crawl pages and extract text
For file: parse text from file
Output: document records

### Job 3: Normalize Content

Clean text and metadata
Output: normalized documents

### Job 4: Chunk Content

Split documents into chunks
Output: chunk records

### Job 5: Embed Chunks

Generate embeddings for each chunk
Output: stored vectors

### Job 6: Mark Source Complete

Update source status and timestamps
Output: ready for retrieval

### Retry policy

* Automatic retry for transient failures
* Dead-letter state after max attempts
* Manual retry available from dashboard

---

## 14. Error Handling

### Website errors

* invalid URL
* blocked or unreachable site
* timeout
* SSRF-safe URL rejection
* crawl depth/page limit exceeded

### File errors

* unsupported file type
* corrupt file
* encrypted PDF
* file too large
* extraction failure

### Processing errors

* chunking failure
* embedding API failure
* vector DB write failure
* LLM failure during chat

### Acceptance Criteria

* Errors are visible to the user in a human-readable form.
* Internal logs preserve technical details for debugging.

---

## 15. Security and Abuse Prevention

* Authenticate all dashboard routes
* Use signed or public-safe token for widget access
* Rate limit public chat endpoints
* Validate file types and size
* Scan or inspect uploaded content where possible
* Block private IP ranges and sensitive metadata when crawling URLs
* Prevent arbitrary outbound requests from crawl jobs
* Store API keys only in secure environment secrets

---

## 16. Monitoring and Analytics

Track:

* total bots created
* sources added per bot
* ingestion success and failure count
* average source processing time
* retrieval latency
* LLM latency
* most queried questions
* number of widget conversations
* retry counts
* source re-sync frequency

Log events:

* source_created
* crawl_started
* crawl_completed
* file_uploaded
* chunk_created
* embedding_generated
* retrieval_requested
* answer_generated
* source_failed

---

## 17. MVP Release Plan

### Phase 1

* Bot CRUD
* Website source ingestion
* File uploads
* Chunking
* Embeddings
* Retrieval

### Phase 2

* Playground chat UI + API
* Source status visibility
* Retry and reprocess
* Widget embed

### Phase 3

* Basic analytics
* Better error handling
* Quality improvements in chunking and retrieval

---

## 18. Definition of Done

A backend MVP release is done when:

* a bot can be created
* at least one website source and one file source can be ingested successfully
* chunks and embeddings are stored correctly
* chat answers can be generated from the knowledge base
* source status is exposed to the frontend
* retries work safely
* public widget chat behaves like playground chat

---

## 19. Risks

* Crawling can be brittle on JavaScript-heavy websites
* Poor extraction quality can reduce answer quality
* Embedding and retrieval quality can vary with chunking strategy
* Over-reliance on one third-party API can create vendor risk
* Public chat endpoints can be abused without rate limits

---

## 20. Open Questions

* Should the MVP use pgvector or an external vector DB?
* Should source processing be fully async from day one?
* Should conversation history be stored or kept stateless in MVP?
* Should source citations be visible in the first release?
* Should website crawling be limited to one domain only or allow subdomains?

---

## 21. Recommended MVP Backend Decision

For speed and simplicity, the recommended backend choice is:

* Postgres as the primary database
* pgvector for vector storage if you want fewer moving parts
* object storage for uploaded files
* background queue for processing jobs
* external crawler API for websites
* external embedding and chat APIs

This gives you a practical, shippable system without overengineering the first version.
