import { Goal } from '@/types'
import { generateId } from '@/lib/utils'

export function createSeedGoals(): Goal[] {
  const now = new Date().toISOString()

  const seeds: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      targetNumber: 1,
      targetName: 'Deliver High-Quality Security Portal Backend Features',
      targetDetails: 'Continue delivering backend features for Security Portal project with high quality standards throughout 2026. Focus on achieving 90%+ test coverage, high first-time code review pass rate, and zero critical production bugs. Expand to full-stack contributions with React frontend components by mid-year.',
      category: 'performance',
      status: 'active',
      rawInput: '',
      quarterPlans: [
        { quarter: 'Q1', items: ['Deliver all assigned Q1 features on time', 'Achieve 90%+ test coverage', 'Pass code review on first attempt for 80%+ of PRs', 'Complete React learning course'] },
        { quarter: 'Q2', items: ['Deliver all assigned Q2 features on time', 'Deliver 1-2 frontend React components', 'Maintain 90%+ test coverage'] },
        { quarter: 'Q3', items: ['Deliver all assigned Q3 features on time', 'Continue full-stack contributions (backend + frontend)', 'Maintain 90%+ test coverage'] },
        { quarter: 'Q4', items: ['Deliver all assigned Q4 features on time', 'Complete 1 full-stack feature (backend API + frontend UI)', 'Maintain 90%+ test coverage', 'Zero critical production bugs year-round'] },
      ],
      successCriteria: [
        'All assigned features deployed to production and stable',
        '85%+ test coverage maintained year-round',
        '80%+ first-time code review pass rate',
        'Zero critical production bugs',
        'Proper integration with IoT infrastructure (Kafka, PostgreSQL, Redis)',
      ],
      milestones: [
        { id: 'M1', dueDate: '31.03.2026', description: 'Deliver all Q1 features with 90%+ coverage. Begin React learning.', status: 'planned' },
        { id: 'M2', dueDate: '30.06.2026', description: 'Deliver all Q2 features with 90%+ coverage. Complete React course and deliver 1-2 frontend components.', status: 'planned' },
        { id: 'M3', dueDate: '30.09.2026', description: 'Deliver all Q3 features with 90%+ coverage. Continue full-stack contributions.', status: 'planned' },
        { id: 'M4', dueDate: '31.12.2026', description: 'Deliver all Q4 features with 90%+ coverage. Complete 1 full-stack feature. Maintain zero critical bugs year-round.', status: 'planned' },
      ],
    },
    {
      targetNumber: 2,
      targetName: 'Maintain and Extend 2hire Multi-Vendor Integration',
      targetDetails: 'Take full ownership of 2hire integration system, ensuring 99.5%+ uptime stability and supporting new vendor integrations. Existing vendors: Ford, Volvo, Mercedes, Kia, Hyundai, Renault. Target: 2+ new vendors (e.g., GM, IVECO) integrated and live in production by end of year.',
      category: 'performance',
      status: 'active',
      rawInput: '',
      quarterPlans: [
        { quarter: 'Q1', items: ['Maintain 99.5%+ system uptime', 'Resolve all critical production issues', 'Monitor system health proactively', 'Begin integration work for 1st new vendor (e.g., GM, IVECO)'] },
        { quarter: 'Q2', items: ['Complete 1st new vendor integration (configuration, testing, deployment)', 'Deploy to production', 'Implement 2+ improvements based on operational insights', 'Update documentation for new vendor', 'Maintain system stability with 99.5%+ uptime'] },
        { quarter: 'Q3', items: ['Document all learnings and best practices', 'Resolve all reported production bugs', 'Maintain 90%+ test coverage for 2hire service', 'Begin 2nd vendor integration'] },
        { quarter: 'Q4', items: ['Complete 2nd vendor integration and deploy to production', 'Achieve 99.5%+ uptime year-round', 'Maintain 85%+ test coverage', 'Document all learnings'] },
      ],
      successCriteria: [
        '99.5%+ system uptime year-round',
        '2+ new vendors successfully integrated and live in production',
        'All critical bugs resolved within SLA',
        '85%+ test coverage maintained',
        'Positive feedback from 2hire team on collaboration',
        'Documentation current and comprehensive',
      ],
      milestones: [
        { id: 'M1', dueDate: '31.03.2026', description: 'Maintain 99.5%+ uptime. Resolve all critical Q1 issues. Begin 1st vendor integration.', status: 'planned' },
        { id: 'M2', dueDate: '30.06.2026', description: 'Complete 1st vendor integration and deploy to production. Implement 2+ improvements.', status: 'planned' },
        { id: 'M3', dueDate: '30.09.2026', description: 'Maintain stability. Begin 2nd vendor integration. Resolve all bugs. Update documentation.', status: 'planned' },
        { id: 'M4', dueDate: '31.12.2026', description: 'Complete 2nd vendor integration. Achieve 99.5%+ uptime year-round. Maintain 85%+ coverage. Document learnings.', status: 'planned' },
      ],
    },
    {
      targetNumber: 3,
      targetName: 'Drive Technical Improvements and Ownership',
      targetDetails: 'Identify, propose, and implement technical improvements that enhance system quality. Deliver 2 technical improvements with written documentation, deploy at least 1 to production with measurable results, and create 1 reusable code pattern adopted by the team.',
      category: 'performance',
      status: 'active',
      rawInput: '',
      quarterPlans: [
        { quarter: 'Q1', items: ['Identify first technical improvement opportunity', 'Create scope definition and initial analysis', 'Examples: database optimization, performance enhancement, tech debt reduction'] },
        { quarter: 'Q2', items: ['Propose 1st technical improvement with full design document', 'Include: problem description, proposed solution, implementation plan, expected impact', 'Begin implementation if approved by team lead'] },
        { quarter: 'Q3', items: ['Complete implementation of 1st improvement', 'Deploy to production', 'Measure and document results (performance metrics, cost savings, etc.)', 'Identify 2nd improvement opportunity'] },
        { quarter: 'Q4', items: ['Propose 2nd improvement with documentation', 'Create and document 1 reusable code pattern or technical guideline', 'Examples: test pattern, error handling, API design guideline', 'Pattern must be adopted by team (referenced in 3+ code reviews)'] },
      ],
      successCriteria: [
        '2 technical improvements proposed with written documentation',
        'At least 1 improvement deployed to production with measurable results',
        '1 reusable pattern documented in Confluence and adopted by team',
        'Positive feedback from team lead or senior developers',
      ],
      milestones: [
        { id: 'M1', dueDate: '31.03.2026', description: 'Identify 1st improvement opportunity with scope definition.', status: 'planned' },
        { id: 'M2', dueDate: '30.06.2026', description: 'Propose 1st improvement with design document. Begin implementation if approved.', status: 'planned' },
        { id: 'M3', dueDate: '30.09.2026', description: 'Complete 1st improvement and deploy. Measure results. Identify 2nd improvement.', status: 'planned' },
        { id: 'M4', dueDate: '31.12.2026', description: 'Propose 2nd improvement. Create 1 reusable pattern adopted by team (3+ code review references).', status: 'planned' },
      ],
    },
    {
      targetNumber: 4,
      targetName: 'Share Knowledge Through Technical Presentations',
      targetDetails: 'Share technical knowledge with team through Knowledge Share Monday presentations. Deliver 4 presentations (1 per quarter, 20-30 minutes + Q&A) covering topics like Security Portal architecture, 2hire patterns, full-stack development, AWS learnings, Kafka fundamentals. All materials shared in Confluence.',
      category: 'performance',
      status: 'active',
      rawInput: '',
      quarterPlans: [
        { quarter: 'Q1', items: ['Deliver 1st presentation (20-30 min + Q&A)', 'Topics: Security Portal backend architecture, 2hire integration patterns, React learnings', 'Prepare slides, code examples, or demos', 'Share materials in Confluence'] },
        { quarter: 'Q2', items: ['Deliver 2nd presentation (20-30 min + Q&A)', 'Topics: Full-stack development, testing strategies, AI prompts usage', 'Share materials in Confluence'] },
        { quarter: 'Q3', items: ['Deliver 3rd presentation (20-30 min + Q&A)', 'Topics: AWS fundamentals learnings, cloud best practices, Terraform introduction', 'Share materials in Confluence'] },
        { quarter: 'Q4', items: ['Deliver 4th presentation (20-30 min + Q&A)', 'Topics: Kafka fundamentals, streaming patterns, year retrospective of technical learnings', 'Share materials in Confluence'] },
      ],
      successCriteria: [
        '4 presentations delivered on schedule (1 per quarter)',
        'Well-prepared presentations with clear structure',
        'Presentation materials shared in Confluence after each session',
        'Positive feedback from attendees',
      ],
      milestones: [
        { id: 'M1', dueDate: '31.03.2026', description: 'Deliver 1st presentation (Security Portal architecture or 2hire patterns).', status: 'planned' },
        { id: 'M2', dueDate: '30.06.2026', description: 'Deliver 2nd presentation. Share materials in Confluence.', status: 'planned' },
        { id: 'M3', dueDate: '30.09.2026', description: 'Deliver 3rd presentation (AWS learnings or testing strategies).', status: 'planned' },
        { id: 'M4', dueDate: '31.12.2026', description: 'Deliver 4th presentation (Kafka fundamentals or year retrospective).', status: 'planned' },
      ],
    },
    {
      targetNumber: 5,
      targetName: 'Build AWS Cloud Platform Fundamentals',
      targetDetails: 'Gain foundational AWS knowledge through structured learning in Q3. Master core services: EC2, S3, IAM, VPC, CloudWatch. Learn IoT/event-driven services: Kinesis, Lambda, DynamoDB, SQS. Deploy 1 Lambda function and obtain AWS Cloud Practitioner certification or complete 5+ hands-on labs.',
      category: 'development',
      status: 'draft',
      rawInput: '',
      quarterPlans: [
        { quarter: 'Q1', items: ['No AWS activities (focus on other targets)'] },
        { quarter: 'Q2', items: ['No AWS activities (focus on other targets)'] },
        { quarter: 'Q3', items: ['Week 1-4 (July): Start AWS Fundamentals course, complete 3 basic labs (S3, EC2, IAM) \u2014 40% progress', 'Week 5-8 (August): Complete AWS Fundamentals course, pass Cloud Practitioner OR 5+ labs, begin IoT services (Kinesis, Lambda, DynamoDB, SQS) \u2014 80% progress', 'Week 9-12 (September): Complete IoT services learning, deploy 1 Lambda function from Kinesis/SQS, write technical summary \u2014 100% complete'] },
        { quarter: 'Q4', items: ['Continue AWS learning: Networking (VPC, subnets, security groups, routing)', 'Monitoring: CloudWatch (metrics, logs, alarms)', 'IoT/Event-Driven: deeper dive into Kinesis, Lambda, DynamoDB, SQS'] },
      ],
      successCriteria: [
        'AWS Fundamentals course certificate',
        'AWS Cloud Practitioner certification OR 5+ hands-on labs completed',
        '1 deployed Lambda function with code in repository and documentation',
        'Technical summary/blog post sharing AWS learnings',
      ],
      milestones: [
        { id: 'M1', dueDate: '31.07.2026', description: 'Complete 40% AWS course. Complete 3 labs (S3, EC2, IAM).', status: 'planned' },
        { id: 'M2', dueDate: '31.08.2026', description: 'Complete 80% AWS course. Complete 5+ labs. Begin AWS IoT services (Kinesis, Lambda).', status: 'planned' },
        { id: 'M3', dueDate: '30.09.2026', description: 'Complete AWS course and Cloud Practitioner OR all labs. Deploy 1 Lambda function. Write technical summary.', status: 'planned' },
      ],
    },
    {
      targetNumber: 6,
      targetName: 'Build Kafka Streaming Platform Fundamentals',
      targetDetails: 'Gain foundational Kafka knowledge through structured learning in Q4. Learn core concepts: Topics, Partitions, Producers, Consumers, Consumer Groups, Offsets, Acknowledgments, retries, idempotency, reliability patterns. Complete 3+ exercises with code in repository.',
      category: 'development',
      status: 'draft',
      rawInput: '',
      quarterPlans: [
        { quarter: 'Q1', items: ['No Kafka activities (focus on other targets)'] },
        { quarter: 'Q2', items: ['No Kafka activities (focus on other targets)'] },
        { quarter: 'Q3', items: ['No Kafka activities (focus on other targets)'] },
        { quarter: 'Q4', items: ['Complete Kafka fundamentals course (Confluent/Udemy)', 'Learn: Topics, Partitions, Producers, Consumers, Consumer Groups, Offsets', 'Learn: Acknowledgments, retries, idempotency, reliability patterns', 'Complete 3+ exercises: simple producer/consumer, consumer groups, error handling'] },
      ],
      successCriteria: [
        'Kafka course certificate',
        '3+ exercises with code in repository',
        'Technical summary/blog post on Kafka learnings',
      ],
      milestones: [
        { id: 'M1', dueDate: '31.10.2026', description: 'Complete 50% Kafka course. Complete 1st exercise (producer/consumer).', status: 'planned' },
        { id: 'M2', dueDate: '30.11.2026', description: 'Complete Kafka course. Complete 2nd and 3rd exercises (consumer groups, error handling).', status: 'planned' },
        { id: 'M3', dueDate: '31.12.2026', description: 'Finalize exercises with code in repo. Write technical summary on Kafka learnings.', status: 'planned' },
      ],
    },
    {
      targetNumber: 7,
      targetName: 'Gain Introduction to Terraform Infrastructure as Code',
      targetDetails: 'Learn Terraform fundamentals for infrastructure as code in Q3-Q4. Cover IaC principles, HCL syntax, State management, AWS Provider, Modules. Create Terraform config for 1 simple deployment: VPC, security groups, compute, storage. Execute terraform plan and terraform apply in dev environment.',
      category: 'development',
      status: 'draft',
      rawInput: '',
      quarterPlans: [
        { quarter: 'Q1', items: ['No Terraform activities (focus on other targets)'] },
        { quarter: 'Q2', items: ['No Terraform activities (focus on other targets)'] },
        { quarter: 'Q3', items: ['Complete 30% Terraform course if time permits after AWS progress'] },
        { quarter: 'Q4', items: ['Complete Terraform course (HashiCorp/Udemy)', 'Learn: IaC principles, HCL syntax, State management, AWS Provider, Modules', 'Create Terraform config for 1 simple deployment: VPC, security groups, compute, storage', 'Execute terraform plan and terraform apply in dev environment'] },
      ],
      successCriteria: [
        'Terraform course certificate',
        'Working configs in version control',
        'Successful deployment to dev environment',
        'Peer review approved',
      ],
      milestones: [
        { id: 'M1', dueDate: '31.07.2026', description: 'Complete 30% Terraform course if time permits after AWS progress.', status: 'planned' },
        { id: 'M2', dueDate: '31.08.2026', description: 'Complete 70% Terraform course. Create basic configs if time permits.', status: 'planned' },
        { id: 'M3', dueDate: '30.09.2026', description: 'Complete Terraform course and deployment OR defer to 2027 based on Q3 workload and AWS priority.', status: 'planned' },
      ],
    },
    {
      targetNumber: 8,
      targetName: 'Build AI-Powered Development Workflow for Team',
      targetDetails: 'Create AI tools that improve team productivity. Q1: Cursor rules and AI prompts for code review and test generation. Q2: Mermaid diagram generator and automated documentation. Q3: Buffer \u2014 maintain tools, gather feedback. Q4: AI troubleshooting guide for K8s or Kafka with symptoms, diagnostics, prompts, solutions.',
      category: 'organizational',
      status: 'active',
      rawInput: '',
      quarterPlans: [
        { quarter: 'Q1', items: ['Create Cursor rules file (code style, patterns, architecture)', 'Write 2 AI prompts: code review assistant, test unit/integration generation', '3+ team members using prompts', 'Add prompt to check code style'] },
        { quarter: 'Q2', items: ['Build Mermaid diagram generator (code/API/DB schemas)', 'Update docs for 2+ services', 'Create usage guide', 'Add prompt documentation for README/TECHNICAL docs'] },
        { quarter: 'Q3', items: ['Buffer \u2014 maintain tools, gather feedback', 'Small improvements based on team feedback'] },
        { quarter: 'Q4', items: ['Create AI troubleshooting guide (K8s OR Kafka)', 'Include: symptoms, diagnostics, AI prompts, solutions', '5+ team references', 'Present to team'] },
      ],
      successCriteria: [
        '3 deliverables completed',
        'Active usage: 3+ users, 2+ updated services, 5+ guide references',
        'Demonstrated in team meeting',
      ],
      milestones: [
        { id: 'M1', dueDate: '31.03.2026', description: 'Create Cursor rules + 2 AI prompts. 3+ team members using.', status: 'planned' },
        { id: 'M2', dueDate: '30.06.2026', description: 'Build Mermaid automation. Update 2+ services. Create guide.', status: 'planned' },
        { id: 'M3', dueDate: '30.09.2026', description: 'Buffer \u2014 maintain tools, gather feedback, small improvements.', status: 'planned' },
        { id: 'M4', dueDate: '31.12.2026', description: 'Create K8s/Kafka troubleshooting guide. 5+ references. Present to team.', status: 'planned' },
      ],
    },
  ]

  return seeds.map((seed) => ({
    ...seed,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }))
}
