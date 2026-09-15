import { RoundtableResponse } from "./types";

export const SAMPLE_PREMIUM_RESULT: RoundtableResponse = {
  intent: ["Healthcare Operations", "Technology Evaluation", "Governance"],
  experts: [
    {
      field: "Physics",
      technicalAnalysis: "Any deployment adds compute, power, cooling, and device constraints. The physical question is not whether the model is intelligent, but whether the required infrastructure remains reliable under real clinical workloads.",
      plainLanguage: "The system still depends on ordinary hardware, electricity, networking, and heat management.",
      keyClaims: [
        { text: "Compute hardware consumes electrical power and dissipates heat.", label: "Established Fact" },
        { text: "Infrastructure limits may affect deployment reliability.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Biology",
      technicalAnalysis: "Biological variation means a triage system will encounter patients whose signals do not fit a clean average case. Population diversity and incomplete observations should therefore remain part of evaluation design.",
      plainLanguage: "Human bodies vary, so a model should not be tested only on neat or typical cases.",
      keyClaims: [
        { text: "Human biological measurements vary across individuals and contexts.", label: "Established Fact" },
        { text: "Evaluation should include heterogeneous cases.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Medicine",
      technicalAnalysis: "A triage tool should support rather than silently replace clinical judgment unless its intended use, validation evidence, failure modes, escalation rules, and governance have been established for the target setting.",
      plainLanguage: "A hospital should know exactly what the model is allowed to do, when staff must override it, and how errors are handled.",
      keyClaims: [
        { text: "Clinical use requires context specific validation and oversight.", label: "Strong Evidence" },
        { text: "The appropriate level of automation depends on the validated use case.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Psychology",
      technicalAnalysis: "Staff may over trust or under trust automated recommendations. Interface design should therefore expose uncertainty, preserve meaningful human review, and avoid presenting model output as unquestionable authority.",
      plainLanguage: "People can trust automation too much or too little, so the interface should make doubt visible.",
      keyClaims: [
        { text: "Automation can affect human judgment and reliance behavior.", label: "Strong Evidence" },
        { text: "Visible uncertainty may help users calibrate reliance.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Psychotherapy",
      technicalAnalysis: "If triage includes mental health presentations, conversational tone and classification must not be confused with therapeutic understanding. Escalation to qualified human care remains a separate design requirement.",
      plainLanguage: "A system can route information without becoming a therapist.",
      keyClaims: [
        { text: "Automated interaction is not equivalent to a therapeutic relationship.", label: "Strong Evidence" },
        { text: "Mental health related routing should include explicit escalation paths.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Chemistry",
      technicalAnalysis: "Medication, laboratory, and biomarker data may enter triage decisions, but the model should not infer chemical or pharmacological meaning beyond the data and rules it was designed to interpret.",
      plainLanguage: "Lab and medication information needs precise interpretation boundaries.",
      keyClaims: [
        { text: "Laboratory measurements and medication data require contextual interpretation.", label: "Established Fact" },
        { text: "Input boundaries should be explicit in the product specification.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Mathematics",
      technicalAnalysis: "Performance should be evaluated with more than one aggregate score. Calibration, subgroup error, false negatives, false positives, prevalence, and decision thresholds can change the operational meaning of the same model output.",
      plainLanguage: "One accuracy number is not enough to understand how a triage model behaves.",
      keyClaims: [
        { text: "Classification performance depends on thresholds and outcome prevalence.", label: "Established Fact" },
        { text: "Multiple metrics are needed for operational evaluation.", label: "Strong Evidence" }
      ]
    },
    {
      field: "Computer Science",
      technicalAnalysis: "The technical design should specify model versioning, logging, input validation, fallback behavior, access control, monitoring, and rollback. These are software system requirements independent of model quality.",
      plainLanguage: "The model is only one component; the surrounding software must also be reliable and observable.",
      keyClaims: [
        { text: "Production software requires monitoring and failure handling.", label: "Established Fact" },
        { text: "Model version and input changes should be traceable.", label: "Strong Evidence" }
      ]
    },
    {
      field: "Robotics & Automation",
      technicalAnalysis: "Although the use case is not robotic, automation principles still apply: define authority, handoff points, safe states, and what happens when sensing or inference becomes unreliable.",
      plainLanguage: "The system needs a safe way to hand control back to people when it is uncertain or unavailable.",
      keyClaims: [
        { text: "Automated systems benefit from explicit fallback states.", label: "Strong Evidence" },
        { text: "Human handoff rules should be designed before deployment.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Music & Sound Science",
      technicalAnalysis: "If voice is used as an input, room acoustics, microphones, language, accent, noise, and speaking style can alter the captured signal. Audio quality should therefore be treated as an input condition, not as a transparent channel.",
      plainLanguage: "Voice input changes with microphones, rooms, noise, accents, and speaking styles.",
      keyClaims: [
        { text: "Recorded audio is affected by capture conditions and acoustic environment.", label: "Established Fact" },
        { text: "Voice based features should be evaluated across realistic recording conditions.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Systems Science",
      technicalAnalysis: "Triage affects queues, staffing, escalation, documentation, and downstream decisions. The intervention should therefore be evaluated as a change to a connected service system rather than as an isolated model benchmark.",
      plainLanguage: "Changing triage can change the whole workflow around it.",
      keyClaims: [
        { text: "Changes in one operational stage can affect downstream processes.", label: "Established Fact" },
        { text: "Evaluation should include system level consequences.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Economics & Incentive Systems",
      technicalAnalysis: "The relevant business case includes implementation cost, staff time, model access, monitoring, error handling, retraining, governance, and the value of any verified operational improvement.",
      plainLanguage: "The price of the model is not the full cost of using it.",
      keyClaims: [
        { text: "Operational technology costs extend beyond initial software acquisition.", label: "Established Fact" },
        { text: "The business case should include error and oversight costs.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Ethics & Governance",
      technicalAnalysis: "Governance should define accountability, appeal, auditability, privacy, bias monitoring, access, and the decisions that remain reserved for qualified staff. These rules should exist before scale increases dependence on the system.",
      plainLanguage: "Someone must remain accountable for how the system is used and how people can challenge its output.",
      keyClaims: [
        { text: "Accountability and privacy are material governance concerns in clinical systems.", label: "Strong Evidence" },
        { text: "Appeal and audit mechanisms should be specified before deployment.", label: "Theoretical Interpretation" }
      ]
    },
    {
      field: "Anthropology & Sociology",
      technicalAnalysis: "Triage is also a social interaction. Language, institutional trust, access patterns, staff roles, and local expectations can affect who benefits from the system and who experiences friction.",
      plainLanguage: "The same tool can work differently in different communities and institutions.",
      keyClaims: [
        { text: "Technology use is shaped by social and institutional context.", label: "Strong Evidence" },
        { text: "Local deployment research should include affected users and staff.", label: "Theoretical Interpretation" }
      ]
    }
  ],
  debate: {
    agreements: [
      "The model should be evaluated inside the real clinical workflow rather than only as a standalone benchmark.",
      "Human oversight, fallback behavior, logging, and governance should be explicit before deployment.",
      "Performance should be examined across relevant patient groups and operating conditions."
    ],
    conflicts: [
      {
        description: "Automation may improve routing speed while increasing the cost of oversight and failure handling.",
        evidenceStrength: 0.65,
        realWorldImpact: 0.8,
        riskIfIncorrect: 0.75
      },
      {
        description: "A broader model scope may increase utility while making validation and accountability harder.",
        evidenceStrength: 0.55,
        realWorldImpact: 0.75,
        riskIfIncorrect: 0.8
      }
    ],
    resolution: "A limited pilot is more defensible than immediate broad automation. Define the intended use, measure workflow outcomes and subgroup errors, keep explicit human escalation, and expand only if evidence from the target setting supports it.",
    uncertainty: "This sample does not contain real hospital data, model validation results, cost data, or regulatory analysis. Those missing inputs could materially change the decision."
  },
  verdict: {
    coreConclusion: "Treat AI assisted triage as a bounded clinical operations pilot that must earn broader authority through local evidence.",
    supportingEvidenceSummary: "The lenses converge on validation, human handoff, monitoring, workflow effects, and governance as prerequisites for responsible deployment.",
    economicFeasibility: "Undetermined from this sample because implementation, staffing, monitoring, and error costs have not been supplied.",
    ethicalGovernance: "Define accountability, privacy, audit, appeal, subgroup monitoring, and human override before live use.",
    risksTradeOffs: "A narrow pilot may limit immediate efficiency gains, while premature scale may increase operational and clinical risk before local performance is understood.",
    confidenceLevel: 0.62,
    failureConditions: "Do not generalize the pilot if local validation, escalation reliability, subgroup performance, or governance controls are inadequate."
  }
};
