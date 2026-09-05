// Initial Data Store for SynapseAI Platform

export const CREATOR_COURSES = [
  {
    id: 'course-1',
    title: 'Full-Stack AI Agent Engineering (2026)',
    creator: 'Dr. Evelyn Vance (AI Research Lead)',
    badge: 'Bestseller',
    category: 'Engineering & AI',
    rating: 4.9,
    students: 14250,
    duration: '6 hrs',
    xpReward: 1200,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'Master autonomous multi-agent orchestration, tool calling, memory management, and production vector indexing.',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Agentic Architecture & Tool Calling',
        duration: '25 min',
        completed: true,
        xp: 250,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        summary: 'Understand the core loop of AI agents: Perception, Planning, Action Execution, and Reflection.',
        keyTakeaways: [
          'Agents differ from static LLM chats by maintaining state and executing side-effect tools.',
          'Structured JSON schema output ensures deterministic tool parameters.',
          'ReAct (Reasoning + Acting) prompts guide agents through step-by-step resolution.'
        ],
        flashcards: [
          { q: 'What is the ReAct framework in AI Agents?', a: 'A pattern combining Reasoning (thought generation) and Acting (tool invocation) in an iterative loop.' },
          { q: 'Why use JSON Schema for Tool Calling?', a: 'To enforce strict type constraints and parameter structure on model outputs.' }
        ],
        quiz: [
          {
            question: 'Which component enables an AI agent to remember previous context across steps?',
            options: ['System Prompt', 'Vector Store / Short-term Memory', 'Temperature Setting', 'Token Limiter'],
            answer: 1,
            explanation: 'Memory buffers and vector indexes store historical turns and retrieved context for multi-step tasks.'
          },
          {
            question: 'What happens when an agent tool call returns an error status code?',
            options: ['The process crashes', 'The agent receives the error string and reflects to self-correct', 'The user session terminates', 'The model retries infinitely'],
            answer: 1,
            explanation: 'Robust agent frameworks pass error feedback back into the prompt so the agent can modify its strategy.'
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: RAG & Hybrid Vector-Graph Indexing',
        duration: '40 min',
        completed: false,
        xp: 350,
        summary: 'Deep dive into combining dense vector embeddings with sparse graph relationships for zero-hallucination context injection.',
        keyTakeaways: [
          'Hybrid search combines semantic similarity (HNSW) with exact term matching (BM25).',
          'Knowledge Graphs preserve structural relationships between entities that vectors lose.',
          'Reranking models prioritize top-K retrieved chunks before feeding context to LLM.'
        ],
        flashcards: [
          { q: 'What is BM25?', a: 'A classic lexical search ranking function based on term frequency and inverse document frequency.' },
          { q: 'What role does a Reranker play?', a: 'It re-scores retrieved vector chunks using a heavier cross-encoder model to maximize relevance.' }
        ],
        quiz: [
          {
            question: 'What is the main benefit of hybrid search over vector-only search?',
            options: ['Faster indexing time', 'Better recall for specific product IDs, proper names, and exact keywords', 'Lower memory usage', 'Eliminates need for embeddings'],
            answer: 1,
            explanation: 'Vector search can miss exact keyword matches like product codes or acronyms, which BM25 excels at catching.'
          }
        ]
      },
      {
        id: 'mod-3',
        title: 'Module 3: Multi-Agent Collaboration & Orchestration',
        duration: '45 min',
        completed: false,
        xp: 400,
        summary: 'Design supervisor-worker topology, message passing protocols, and conflict resolution between specialized subagents.',
        keyTakeaways: [
          'Supervisor agents break down high-level user tasks into discrete sub-tasks.',
          'Parallel subagent execution speeds up multi-file codebase analysis.',
          'Consensus mechanisms prevent hallucinations in financial and medical agent workflows.'
        ],
        flashcards: [
          { q: 'What is Supervisor Topology?', a: 'A coordinator agent receives the objective and delegates sub-tasks to specialized subagents.' }
        ],
        quiz: [
          {
            question: 'In a supervisor-worker agent system, what is the primary role of the supervisor?',
            options: ['Execute web searches', 'Decompose tasks, assign work, and synthesize final responses', 'Write raw database code', 'Compress images'],
            answer: 1,
            explanation: 'The supervisor coordinates subagent execution, routes context, and synthesizes overall output.'
          }
        ]
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Modern Product Systems & Micro-SaaS UX',
    creator: 'Elena Rostova (Lead Product Designer)',
    badge: 'Trending',
    category: 'Design & UX',
    rating: 4.8,
    students: 8900,
    duration: '4.5 hrs',
    xpReward: 900,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    description: 'Learn modern dark glassmorphism, micro-interactions, container queries, and conversion-optimized AI interfaces.',
    modules: [
      {
        id: 'mod-201',
        title: 'Module 1: Glassmorphism & Tokenized Design Systems',
        duration: '30 min',
        completed: true,
        xp: 300,
        summary: 'Design sleek, high-contrast dark interfaces using CSS backdrop-filter, HSL color tokens, and elevation levels.',
        keyTakeaways: ['Use semi-transparent backgrounds with blur filters', 'High contrast text hierarchy improves legibility'],
        flashcards: [
          { q: 'What CSS property creates glassmorphism blur?', a: 'backdrop-filter: blur(16px);' }
        ],
        quiz: [
          {
            question: 'Why is backdrop-filter preferred over opacity alone for glass UI?',
            options: ['It uses less GPU', 'It blurs content underneath the element creating true optical depth', 'It works without CSS', 'It makes elements invisible'],
            answer: 1,
            explanation: 'Backdrop-filter applies optical blur effects to whatever renders behind the element.'
          }
        ]
      }
    ]
  }
];

export const PRESET_SELF_COURSES = [
  {
    id: 'self-1',
    title: 'Mastering LLM Inference Optimization & Quantization',
    createdDate: '2026-08-02',
    sources: [
      { type: 'YouTube', name: 'vLLM & PagedAttention Deep Dive', url: 'https://youtube.com/watch?v=example1' },
      { type: 'ChatGPT', name: 'Claude vs GPT-4o Token Efficiency Log', url: 'ChatGPT Export #4092' },
      { type: 'Substack', name: 'The AI Hardware & Memory Wall', url: 'https://substack.com/@techdigest/paged-attention' }
    ],
    status: 'Articulated & Ready',
    estimatedTime: '45 mins',
    tags: ['AI Ops', 'Inference', 'Quantization'],
    modules: [
      {
        id: 'smod-1',
        title: 'Chapter 1: The Memory Bottleneck & KV Cache',
        summary: 'How Key-Value caching accelerates token generation but consumes massive VRAM during long-context inferences.',
        content: `During autoregressive LLM decoding, generating token $N$ requires attending to all prior tokens $0 \dots N-1$. Computing key and value vectors repeatedly is computationally wasteful, so frameworks store these vectors in a **KV Cache**. However, for a 70B parameter model with 128k context length, the KV Cache alone can consume over 30GB of GPU RAM per request. PagedAttention solves this by allocating KV cache in non-contiguous virtual pages similar to virtual memory operating systems!`,
        flashcards: [
          { q: 'What does KV Cache stand for?', a: 'Key-Value Cache used during LLM autoregressive generation.' },
          { q: 'How does PagedAttention reduce VRAM fragmentation?', a: 'By partitioning KV cache into fixed-size block pages allocated dynamic on-demand.' }
        ],
        quiz: [
          {
            question: 'What is the main driver of memory consumption during long-context batch inference?',
            options: ['Model weights alone', 'KV Cache storage per active sequence', 'CPU RAM transfer speed', 'CSS rendering'],
            answer: 1,
            explanation: 'KV cache grows linearly with context length and batch size, making memory allocation critical.'
          }
        ]
      },
      {
        id: 'smod-2',
        title: 'Chapter 2: FP16 to INT4 Quantization (AWQ & GGUF)',
        summary: 'Comparing Activation-aware Weight Quantization (AWQ) with GGUF format for edge deployment.',
        content: `Quantization compresses 16-bit floating point model weights into 4-bit integers. AWQ selectively protects the top 1% salient weight channels that preserve model accuracy, yielding near-lossless 4-bit execution with 3x speedup on consumer GPUs.`,
        flashcards: [
          { q: 'What is AWQ?', a: 'Activation-aware Weight Quantization that protects critical channels during 4-bit compression.' }
        ],
        quiz: [
          {
            question: 'Why does AWQ protect specific weight channels from 4-bit quantization?',
            options: ['Because those channels hold system prompts', 'Because activation magnitudes show ~1% of weights carry 90% of model intelligence', 'To make files larger', 'To bypass license checks'],
            answer: 1,
            explanation: 'Observation shows activation spikes occur in specific channels; protecting them prevents perplexity degradation.'
          }
        ]
      }
    ]
  }
];

export const BUILDER_TRACKS = [
  {
    id: 'track-1',
    title: 'Build a Multi-Tool AI Support Agent',
    level: 'Beginner Non-Developer',
    time: '35 mins',
    icon: 'Bot',
    description: 'Learn how to connect an LLM to a live search tool and database to handle customer inquiries dynamically.',
    steps: [
      {
        step: 1,
        title: 'Define Persona & System Instructions',
        instruction: 'Craft a strict persona that restricts responses to verified knowledge base sources and forces JSON tool calls when necessary.',
        defaultPrompt: 'You are NexusBot, an expert technical support engineer. Always inspect context first. If answer is missing, trigger tool [search_docs].',
        toolToEnable: 'search_docs',
        testInput: 'How do I reset my API key in SynapseAI?',
        simulatedOutput: '⚡ NexusBot called tool: search_docs("API key reset") -> Found match: Go to Settings > Security > Regenerate Secret Key.',
        hint: 'Non-developers can adjust tone, confidence threshold, and available tools without writing raw Python!'
      },
      {
        step: 2,
        title: 'Add RAG Vector Database Tool',
        instruction: 'Attach your uploaded PDF documentation as a vector retrieval tool.',
        defaultPrompt: 'You have access to vector_store("customer_kb"). Retrieve top 3 relevant passages before generating response.',
        toolToEnable: 'vector_store',
        testInput: 'What is your refund policy for unused credits?',
        simulatedOutput: '📄 Vector search returned match (score 0.94): "Refunds are processed within 7 business days for requests made within 14 days of purchase."',
        hint: 'Vector retrieval prevents hallucinations by grounding the agent on official policy documents.'
      },
      {
        step: 3,
        title: 'Deploy & Test Live Simulator',
        instruction: 'Test your completed agent flow in the live sandbox widget below.',
        defaultPrompt: 'System ready. Agent active with tools: [search_docs, vector_store, trigger_ticket].',
        toolToEnable: 'all',
        testInput: 'My billing page is throwing 500 error',
        simulatedOutput: '🚨 NexusBot recognized system incident! Triggered tool: create_support_ticket(priority="HIGH", issue="Billing 500"). Ticket #8921 logged.',
        hint: 'Congratulations! You just configured an autonomous agent with multi-tool fallback logic.'
      }
    ]
  },
  {
    id: 'track-2',
    title: 'Vibe Code a Micro-SaaS Content Converter',
    level: 'Intermediate Non-Developer',
    time: '45 mins',
    icon: 'Sparkles',
    description: 'Build a tool that converts long YouTube links into viral LinkedIn posts, Twitter threads, and email newsletters.',
    steps: [
      {
        step: 1,
        title: 'Set up Transcript Extraction Pipeline',
        instruction: 'Configure the video URL parser and speech-to-text prompt node.',
        defaultPrompt: 'Input: YouTube Video URL. Output: Clean transcript JSON with speaker diarization.',
        toolToEnable: 'youtube_transcript_fetcher',
        testInput: 'https://youtube.com/watch?v=sample-tech-talk',
        simulatedOutput: '✅ Extracted 3,400 words of transcript. Main topics identified: [Agentic AI, Web Vitals, Vector DBs].',
        hint: 'Transcripts provide high-density raw knowledge ready for LLM synthesis.'
      },
      {
        step: 2,
        title: 'Chain Content Repurposing Prompts',
        instruction: 'Create sub-prompts for LinkedIn post format and Twitter thread format.',
        defaultPrompt: 'Transform raw transcript into: 1x Punchy LinkedIn post with emoji hooks, 1x 5-tweet thread with key takeaways.',
        toolToEnable: 'content_repurposer',
        testInput: 'Repurpose recent AI talk transcript',
        simulatedOutput: '📱 Post preview generated! 🚀 "3 Mind-Blowing AI Trends from 2026..." (Saved to Drafts).',
        hint: 'Prompt chaining breaks complex multi-platform output generation into high-quality single focus steps.'
      }
    ]
  }
];
