import { GoalCategory, QuarterPlan, Milestone, MilestoneStatus } from '@/types'

export interface GoalTemplate {
  name: string
  description: string
  category: GoalCategory
  targetName: string
  targetDetails: string
  quarterPlans: QuarterPlan[]
  successCriteria: string[]
  milestones: Milestone[]
}

const planned = 'planned' as MilestoneStatus

export const goalTemplates: GoalTemplate[] = [
  {
    name: 'System Reliability & SLA',
    description: 'Improve service uptime and reliability metrics',
    category: 'performance',
    targetName: 'Improve System Reliability to 99.9% Uptime',
    targetDetails: 'Design, implement and maintain infrastructure and application improvements to achieve and sustain 99.9% uptime SLA for core services. This includes establishing monitoring dashboards, automated alerting, incident response procedures, and proactive capacity planning to minimize unplanned downtime and reduce mean time to recovery (MTTR).',
    quarterPlans: [
      { quarter: 'Q1', items: ['Audit current reliability metrics and identify top 3 failure modes', 'Set up comprehensive monitoring and alerting dashboards'] },
      { quarter: 'Q2', items: ['Implement automated health checks and self-healing mechanisms', 'Establish incident response runbooks for critical paths'] },
      { quarter: 'Q3', items: ['Conduct chaos engineering exercises to validate resilience', 'Optimize database connection pools and caching strategies'] },
      { quarter: 'Q4', items: ['Achieve 99.9% uptime target consistently', 'Document lessons learned and hand over operational procedures'] },
    ],
    successCriteria: [
      'Service uptime reaches and sustains 99.9% measured monthly',
      'MTTR reduced to under 15 minutes for P1 incidents',
      'Monitoring coverage for all critical service endpoints',
      'Zero data-loss incidents throughout the year',
    ],
    milestones: [
      { id: 'M1', dueDate: 'Mar 31', description: 'Monitoring dashboards and alerting fully operational', status: planned },
      { id: 'M2', dueDate: 'Jun 30', description: 'Self-healing and runbooks in place', status: planned },
      { id: 'M3', dueDate: 'Sep 30', description: 'Chaos engineering validated resilience', status: planned },
      { id: 'M4', dueDate: 'Dec 31', description: '99.9% uptime achieved for 3 consecutive months', status: planned },
    ],
  },
  {
    name: 'Tech Debt Reduction',
    description: 'Systematically reduce technical debt in codebase',
    category: 'performance',
    targetName: 'Reduce Technical Debt by 40%',
    targetDetails: 'Systematically identify, prioritize, and eliminate technical debt across the codebase. Focus on deprecated dependencies, code duplication, missing tests, and architectural improvements. Track progress using code quality metrics and establish guardrails to prevent new debt accumulation.',
    quarterPlans: [
      { quarter: 'Q1', items: ['Complete technical debt audit and create prioritized backlog', 'Address top 10 critical dependency upgrades'] },
      { quarter: 'Q2', items: ['Refactor 3 highest-complexity modules', 'Increase test coverage for legacy code from current to 70%'] },
      { quarter: 'Q3', items: ['Migrate deprecated APIs and libraries', 'Implement automated code quality gates in CI/CD'] },
      { quarter: 'Q4', items: ['Complete remaining backlog items', 'Establish tech debt review process for new code'] },
    ],
    successCriteria: [
      'Technical debt backlog reduced by 40% (measured by tracked items)',
      'No critical or high-severity dependency vulnerabilities',
      'Test coverage increased to minimum 70% across all modules',
      'Code quality gates passing for all new PRs',
    ],
    milestones: [
      { id: 'M1', dueDate: 'Mar 31', description: 'Debt audit complete, critical dependencies updated', status: planned },
      { id: 'M2', dueDate: 'Jun 30', description: 'High-complexity modules refactored, test coverage at 70%', status: planned },
      { id: 'M3', dueDate: 'Sep 30', description: 'Deprecated APIs migrated, quality gates live', status: planned },
      { id: 'M4', dueDate: 'Dec 31', description: '40% debt reduction achieved', status: planned },
    ],
  },
  {
    name: 'Learn New Technology',
    description: 'Develop expertise in a new technology area',
    category: 'development',
    targetName: 'Achieve Professional Certification in Cloud/DevOps',
    targetDetails: 'Acquire deep expertise in a target technology area (e.g., AWS Solutions Architect, CKA, or Terraform Associate) through structured learning, hands-on practice, and professional certification. Apply the knowledge to at least one production project and share learnings with the team.',
    quarterPlans: [
      { quarter: 'Q1', items: ['Complete foundational courses and study materials', 'Set up personal lab environment for hands-on practice'] },
      { quarter: 'Q2', items: ['Complete advanced modules and practice exams', 'Apply concepts to a proof-of-concept project'] },
      { quarter: 'Q3', items: ['Pass the certification exam', 'Begin applying knowledge to a production project'] },
      { quarter: 'Q4', items: ['Complete production project using new skills', 'Deliver knowledge-sharing session to the team'] },
    ],
    successCriteria: [
      'Professional certification obtained',
      'At least one production system designed/improved using new skills',
      'Knowledge-sharing session delivered to team (min 30 min)',
      'Personal study log maintained with 100+ hours tracked',
    ],
    milestones: [
      { id: 'M1', dueDate: 'Mar 31', description: 'Foundational training complete, lab environment ready', status: planned },
      { id: 'M2', dueDate: 'Jun 30', description: 'Advanced modules done, POC project completed', status: planned },
      { id: 'M3', dueDate: 'Sep 30', description: 'Certification exam passed', status: planned },
      { id: 'M4', dueDate: 'Dec 31', description: 'Production project complete, knowledge shared', status: planned },
    ],
  },
  {
    name: 'Mentoring & Knowledge Sharing',
    description: 'Mentor juniors and contribute to team growth',
    category: 'organizational',
    targetName: 'Establish Mentoring Program and Knowledge Base',
    targetDetails: 'Lead mentoring initiatives for 2-3 junior/mid-level engineers, establish regular knowledge-sharing sessions, and build a comprehensive team knowledge base. Focus on accelerating team member growth, reducing onboarding time, and fostering a learning culture within the engineering organization.',
    quarterPlans: [
      { quarter: 'Q1', items: ['Identify 2-3 mentees and establish mentoring agreements', 'Create initial knowledge base structure with top 10 critical topics'] },
      { quarter: 'Q2', items: ['Conduct bi-weekly 1:1 mentoring sessions', 'Deliver 3 brown-bag sessions on core architecture topics'] },
      { quarter: 'Q3', items: ['Guide mentees through technical design reviews', 'Expand knowledge base to 25+ articles'] },
      { quarter: 'Q4', items: ['Evaluate mentee growth and gather feedback', 'Establish self-sustaining knowledge-sharing rotation'] },
    ],
    successCriteria: [
      'Mentoring 2-3 engineers with documented development plans',
      'Knowledge base with 25+ articles, used by team regularly',
      'Delivered 6+ knowledge-sharing sessions throughout the year',
      'Measurable improvement in mentee autonomy (reduced PR review rounds)',
    ],
    milestones: [
      { id: 'M1', dueDate: 'Mar 31', description: 'Mentoring agreements signed, knowledge base scaffolded', status: planned },
      { id: 'M2', dueDate: 'Jun 30', description: '3 brown-bag sessions delivered, regular 1:1s running', status: planned },
      { id: 'M3', dueDate: 'Sep 30', description: '25+ knowledge base articles, mentees leading designs', status: planned },
      { id: 'M4', dueDate: 'Dec 31', description: 'Knowledge-sharing rotation self-sustaining', status: planned },
    ],
  },
  {
    name: 'Code Quality & Testing',
    description: 'Improve testing practices and code quality standards',
    category: 'performance',
    targetName: 'Achieve 80% Test Coverage with Quality Testing Practices',
    targetDetails: 'Transform the team testing culture by implementing comprehensive testing strategies including unit, integration, and end-to-end tests. Establish code review standards, introduce mutation testing, and create testing guidelines that ensure high confidence in deployments while maintaining development velocity.',
    quarterPlans: [
      { quarter: 'Q1', items: ['Establish testing standards document and review guidelines', 'Set up mutation testing in CI pipeline for 2 core services'] },
      { quarter: 'Q2', items: ['Increase unit test coverage to 80% for core modules', 'Implement integration test suite for critical flows'] },
      { quarter: 'Q3', items: ['Add contract testing for inter-service communication', 'Introduce performance regression tests'] },
      { quarter: 'Q4', items: ['Achieve 80% overall test coverage', 'Publish testing best practices guide for the organization'] },
    ],
    successCriteria: [
      'Overall test coverage reaches 80% across all services',
      'Mutation testing score above 60% for core modules',
      'Zero production incidents caused by untested code paths',
      'Testing guidelines adopted by at least 2 other teams',
    ],
    milestones: [
      { id: 'M1', dueDate: 'Mar 31', description: 'Testing standards published, mutation testing in CI', status: planned },
      { id: 'M2', dueDate: 'Jun 30', description: '80% unit test coverage, integration suite live', status: planned },
      { id: 'M3', dueDate: 'Sep 30', description: 'Contract and performance tests operational', status: planned },
      { id: 'M4', dueDate: 'Dec 31', description: '80% total coverage, best practices guide published', status: planned },
    ],
  },
  {
    name: 'Cross-team Collaboration',
    description: 'Improve inter-team communication and project delivery',
    category: 'organizational',
    targetName: 'Lead Cross-team Initiative to Production',
    targetDetails: 'Initiate and lead a cross-team project that delivers measurable business value. Establish communication channels, align technical approaches, manage dependencies, and ensure on-time delivery while building lasting collaborative relationships between teams.',
    quarterPlans: [
      { quarter: 'Q1', items: ['Identify cross-team initiative and align stakeholders', 'Create project plan with clear milestones and RACI matrix'] },
      { quarter: 'Q2', items: ['Lead bi-weekly sync meetings with all teams', 'Deliver first integration milestone'] },
      { quarter: 'Q3', items: ['Complete end-to-end integration testing', 'Address cross-team technical debt and compatibility issues'] },
      { quarter: 'Q4', items: ['Ship initiative to production', 'Document collaboration playbook for future cross-team work'] },
    ],
    successCriteria: [
      'Cross-team initiative shipped to production on schedule',
      'Positive collaboration feedback from all participating teams',
      'Reusable integration patterns documented and shared',
      'Reduced dependency resolution time by 50%',
    ],
    milestones: [
      { id: 'M1', dueDate: 'Mar 31', description: 'Stakeholders aligned, project plan approved', status: planned },
      { id: 'M2', dueDate: 'Jun 30', description: 'First integration milestone delivered', status: planned },
      { id: 'M3', dueDate: 'Sep 30', description: 'E2E integration testing complete', status: planned },
      { id: 'M4', dueDate: 'Dec 31', description: 'Initiative in production, playbook published', status: planned },
    ],
  },
  {
    name: 'Process Improvement',
    description: 'Improve CI/CD, observability, and development workflows',
    category: 'development',
    targetName: 'Optimize CI/CD Pipeline and Observability Stack',
    targetDetails: 'Redesign and optimize the CI/CD pipeline to reduce build times, increase deployment frequency, and improve observability. Implement structured logging, distributed tracing, and automated deployment verification to achieve faster, safer releases with full visibility into system behavior.',
    quarterPlans: [
      { quarter: 'Q1', items: ['Audit current CI/CD pipeline and identify bottlenecks', 'Implement parallel test execution to reduce build time'] },
      { quarter: 'Q2', items: ['Set up distributed tracing across all microservices', 'Create SLO-based alerting dashboards'] },
      { quarter: 'Q3', items: ['Implement canary deployments and automated rollback', 'Add structured logging standards across services'] },
      { quarter: 'Q4', items: ['Achieve target deployment frequency (daily)', 'Document operational runbooks and on-call procedures'] },
    ],
    successCriteria: [
      'CI/CD pipeline build time reduced by 50%',
      'Deployment frequency increased to daily releases',
      'Distributed tracing coverage across all production services',
      'Mean time to detect (MTTD) issues reduced by 60%',
    ],
    milestones: [
      { id: 'M1', dueDate: 'Mar 31', description: 'Pipeline audit complete, parallel tests running', status: planned },
      { id: 'M2', dueDate: 'Jun 30', description: 'Distributed tracing live, SLO dashboards operational', status: planned },
      { id: 'M3', dueDate: 'Sep 30', description: 'Canary deployments and structured logging in place', status: planned },
      { id: 'M4', dueDate: 'Dec 31', description: 'Daily deployments achieved, runbooks published', status: planned },
    ],
  },
]
