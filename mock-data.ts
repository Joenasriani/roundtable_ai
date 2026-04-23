import { RoundtableResponse } from "./types";

export const SAMPLE_PREMIUM_RESULT: RoundtableResponse = {
  intent: ["Strategic Infrastructure", "Healthcare Ethics", "Automation Policy"],
  experts: [
    {
      field: "Physics",
      technicalAnalysis: "Energy dissipation in massive compute clusters is approaching the Landauer limit. Sustainable AI requires a transition to reversible computing and photonic interconnects to mitigate thermal entropy.",
      plainLanguage: "Chips are getting too hot. We need light-based connections to keep the 'brain' cool and efficient.",
      keyClaims: [
        { text: "Thermal noise limits qubit stability in current-gen hardware.", label: "Established Fact" },
        { text: "Photonic compute reduces latency by factor of 100.", label: "Strong Evidence" }
      ]
    },
    {
      field: "Biology",
      technicalAnalysis: "Biological intelligence operates at 20W via sparse activation. Artificial models are 'dense' and energetically expensive. Neuromorphic chips must mimic synaptic pruning to survive ecosystem constraints.",
      plainLanguage: "The human brain is millions of times more efficient than AI. We must copy how it clears 'unused' connections to save power.",
      keyClaims: [
        { text: "Human brain consumes ~20 Watts for high-level reasoning.", label: "Established Fact" },
        { text: "Silicon energy density is unsustainable for mobile autonomy.", label: "Strong Evidence" }
      ]
    },
    {
      field: "Medicine",
      technicalAnalysis: "AI-driven diagnostics reduce false negatives in histopathology by 30%. However, latent class models show high variance in edge cases which requires redundant human-in-the-loop verification.",
      plainLanguage: "AI is great at spotting diseases early, but it still makes weird mistakes that need a doctor to double-check.",
      keyClaims: [
        { text: "Deep learning exceeds human accuracy in radiological screening.", label: "Established Fact" },
        { text: "Diagnostic opacity leads to decreased clinical trust.", label: "Strong Evidence" }
      ]
    },
    {
      field: "Psychology",
      technicalAnalysis: "Human-AI interaction triggers 'parasocial' anchoring. Users tend to overestimate the intentionality of LLMs, leading to cognitive dependency and altered decision-making heuristics.",
      plainLanguage: "People start trusting AI like a real person, which can make them forget how to think for themselves.",
      keyClaims: [
        { text: "The ELIZA effect causes anthropomorphic bias.", label: "Established Fact" },
        { text: "Extended AI assistance reduces task-switching cognitive load.", label: "Strong Evidence" }
      ]
    },
    {
      field: "Psychotherapy",
      technicalAnalysis: "Emotional mirroring by AI creates a 'therapeutic vacuum'. While useful for exposure therapy, it lacks the 'Biological Empathy' necessary for deep trauma resolution.",
      plainLanguage: "AI can listen and help with small stress, but it doesn't have a soul or body, so it can't truly feel your pain.",
      keyClaims: [
        { text: "Cognitive Behavioral Therapy (CBT) modules are digitizable.", label: "Established Fact" },
        { text: "Empathetic simulation improves user engagement by 40%.", label: "Strong Evidence" }
      ]
    },
    {
      field: "Chemistry",
      technicalAnalysis: "AI is accelerating 'De Novo' drug discovery via molecular docking simulations. We can now screen 10^12 compounds in hours instead of years.",
      plainLanguage: "AI helps find new medicines by testing billions of chemical recipes in a computer very fast.",
      keyClaims: [
        { text: "AlphaFold 2 solved protein structure prediction.", label: "Established Fact" },
        { text: "Small molecule synthesis pipelines are now 60% autonomous.", label: "Strong Evidence" }
      ]
    },
    {
      field: "Mathematics",
      technicalAnalysis: "Category theory provides a framework for multi-modal alignment. We use topological data analysis to mapping the hidden 'latent space' of artificial intelligence.",
      plainLanguage: "We use high-level math to see how AI links different ideas together, like mapping a giant invisible library.",
      keyClaims: [
        { text: "Manifold learning explains high-dimensional data clustering.", label: "Established Fact" },
        { text: "Linear algebra is the core of backpropagation.", label: "Established Fact" }
      ]
    },
    {
      field: "Computer Science",
      technicalAnalysis: "The bottleneck is no longer FLOPs, but memory bandwidth. High-Bandwidth Memory (HBM) and Compute-in-Memory are essential for the next 10x jump.",
      plainLanguage: "Computers are fast at math but slow at moving data around. We need to build memory and processors closer together.",
      keyClaims: [
        { text: "Transformer scaling laws follow power-law distributions.", label: "Established Fact" },
        { text: "State-space models (SSMs) offer linear sequence scaling.", label: "Strong Evidence" }
      ]
    },
    {
      field: "Robotics & Automation",
      technicalAnalysis: "Proprioceptive feedback in manipulators is achieving sub-millimeter precision. End-to-end learning for control removes the need for brittle inverse kinematics code.",
      plainLanguage: "Robots are getting as delicate as human hands. They don't need hard coding anymore; they learn by trying.",
      keyClaims: [
        { text: "Soft robotics improves human-collocation safety.", label: "Strong Evidence" },
        { text: "Reinforcement learning optimizes bipedal locomotion.", label: "Established Fact" }
      ]
    },
    {
      field: "Music & Sound Science",
      technicalAnalysis: "Generative audio is mastering timbre and spatialization. We've reached the point where Fourier analysis cannot distinguish synthetic from acoustic waveforms in blind tests.",
      plainLanguage: "Computers can make music that sounds perfectly real. Even experts can't tell the difference anymore.",
      keyClaims: [
        { text: "Diffractive neural networks simulate acoustic acoustics.", label: "Strong Evidence" },
        { text: "WaveNet-style synthesis produces human-parity speech.", label: "Established Fact" }
      ]
    },
    {
      field: "Systems Science",
      technicalAnalysis: "Complexity Theory shows that AI introduces a 'Coupling Risk'. Small errors in one automated system can cascade through interconnected global infrastructures.",
      plainLanguage: "If every system is connected by AI, a small glitch in one place could break everything else across the world.",
      keyClaims: [
        { text: "Highly optimized systems are prone to fragility.", label: "Established Fact" },
        { text: "Feedback loops in AI-trading cause flash crashes.", label: "Strong Evidence" }
      ]
    },
    {
      field: "Economics & Incentive Systems",
      technicalAnalysis: "The Marginal Cost of Intelligence is approaching zero. This triggers a paradigm shift where wealth is derived from compute-energy ownership rather than labor equity.",
      plainLanguage: "Thinking is becoming free. In the future, being rich will mean owning the computers and the power, not the workers.",
      keyClaims: [
        { text: "Automation replaces routinized cognitive labor first.", label: "Established Fact" },
        { text: "Universal Basic Income becomes mathematically necessary at 40% job replacement.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Ethics & Governance",
      technicalAnalysis: "Algorithmic Sovereignty is the next frontier of human rights. Without 'Open Weights', the future of thought is effectively a corporate-owned utility.",
      plainLanguage: "If a few companies own all the smart AI, they control how we think. We need 'Public AI' to keep our minds free.",
      keyClaims: [
        { text: "Data provenance is key to copyright mitigation.", label: "Strong Evidence" },
        { text: "Black-box algorithms violate the right to explanation.", label: "Established Fact" }
      ]
    },
    {
      field: "Anthropology & Sociology",
      technicalAnalysis: "Technological Accelerationism is eroding local cultures toward a 'Global Monoculture'. We are trading diverse human heuristics for a single, silicon-averaged behavior set.",
      plainLanguage: "AI is making everyone act and think the same way. We're losing the special, weird ways different cultures live.",
      keyClaims: [
        { text: "Social media algorithms polarize distinct tribal groups.", label: "Established Fact" },
        { text: "AI-generated art creates an aesthetic echo chamber.", label: "Strong Evidence" }
      ]
    }
  ],
  debate: {
    agreements: [
      "AI requires revolutionary energy efficiency improvements.",
      "Automation will fundamentally destabilize traditional labor economics.",
      "Regulatory oversight must move from reactive to proactive."
    ],
    conflicts: [
      {
        description: "Economics vs. Ethics on Data Ownership",
        evidenceStrength: 0.85,
        realWorldImpact: 0.95,
        riskIfIncorrect: 0.75
      },
      {
        description: "Physics vs. CS on Quantum Scalability",
        evidenceStrength: 0.45,
        realWorldImpact: 0.88,
        riskIfIncorrect: 0.9
      }
    ],
    resolution: "The panel concludes that human-centric AI requires an 'Energy-Labor-Ethics' triad. We must optimize for the brain's 20W efficiency while ensuring the economic gains are democratized.",
    uncertainty: "Long-term emergent behavior of Recursive Self-Improvement remains an unpredictable black swan."
  },
  verdict: {
    coreConclusion: "Humanity must steer AI toward biological-scale efficiency and decentralized ownership to avoid a centralized power collapse.",
    supportingEvidenceSummary: "Physics proves current scaling is unsustainable; Economics proves current labor models will fail; Ethics demands a shift in ownership.",
    economicFeasibility: "High, if we transition from income tax to equity-based data ownership.",
    ethicalGovernance: "Requires a global 'AI Constitution' enforced by cryptographic proofs.",
    risksTradeOffs: "Stalling AI development risks losing global competitiveness; accelerating it risks existential misalignment.",
    confidenceLevel: 0.89,
    failureConditions: "Concentration of hardware power in a single geopolitical territory."
  }
};
